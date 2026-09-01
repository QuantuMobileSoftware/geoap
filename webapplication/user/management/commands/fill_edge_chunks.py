import json
import logging
import os
import re
from datetime import date as date_cls, datetime, timedelta, timezone

from django.conf import settings
from django.core.management.base import BaseCommand
from google.cloud import storage

from user.models import EdgeCoverage, EdgePrediction, StonesDetectionChunk, User
from user.serializers import CoverageMetadataSerializer, PredictionsMetadataSerializer
from user.stone_device_views import parse_gprmc

logger = logging.getLogger(__name__)

# {username}/{date}/{chunk}/{predictions|coverage}/{uuid}/{uuid}.json
_BLOB_RE = re.compile(
    r'^(?P<username>[^/]+)/(?P<date>\d{4}-\d{2}-\d{2})/(?P<chunk>\d+)/'
    r'(?P<type>predictions|coverage)/(?P<folder_uuid>[^/]+)/(?P=folder_uuid)\.json$'
)

_SERIALIZERS = {
    StonesDetectionChunk.TYPE_PREDICTIONS: PredictionsMetadataSerializer,
    StonesDetectionChunk.TYPE_COVERAGE: CoverageMetadataSerializer,
}

_BACKFILL_STATUS = {
    StonesDetectionChunk.TYPE_PREDICTIONS: StonesDetectionChunk.STATUS_DONE,
    StonesDetectionChunk.TYPE_COVERAGE: StonesDetectionChunk.STATUS_UPLOADING,
}


def _gcs_client() -> storage.Client:
    creds_path = os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.OPERATIONS_SERVICE_CREDS)
    return storage.Client.from_service_account_json(creds_path)


def _processing_start(chunk_date: date_cls, chunk_index: int) -> datetime:
    chunk_start = datetime(
        chunk_date.year, chunk_date.month, chunk_date.day, chunk_index * 4, tzinfo=timezone.utc
    )
    return chunk_start + timedelta(hours=4)


class Command(BaseCommand):
    help = (
        "Fill EdgePrediction/EdgeCoverage rows (and their parent "
        "StonesDetectionChunk) from metadata JSON blobs already sitting in "
        "each user's GCS bucket, for chunks uploaded before the app started "
        "writing these rows to the DB."
    )

    def add_arguments(self, parser):
        parser.add_argument('--username', help='Only backfill this user (default: all users with a bucket configured)')
        parser.add_argument('--dry-run', action='store_true', help='Report what would be created without writing anything')
        parser.add_argument(
            '--limit', type=int, default=None,
            help='Stop after successfully processing this many rows (created, or would-be-created in --dry-run). '
                 'Use --limit 1 to try the command against a single file.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']

        users = User.objects.exclude(stones_storage_edge__isnull=True).exclude(stones_storage_edge='')
        if options.get('username'):
            users = users.filter(username=options['username'])

        if not users.exists():
            logger.warning("No matching users with stones_storage_edge configured.")
            return

        client = _gcs_client()
        total_created = 0
        total_skipped_existing = 0
        total_invalid = 0

        for user in users:
            bucket_name = user.stones_storage_edge
            bucket = client.bucket(bucket_name)
            logger.info(f"Scanning gs://{bucket_name}/{user.username}/ for user={user.username} ...")

            user_created = 0
            for blob in client.list_blobs(bucket, prefix=f'{user.username}/'):
                if limit is not None and total_created >= limit:
                    break

                match = _BLOB_RE.match(blob.name)
                if not match:
                    continue

                chunk_type = match.group('type')
                date_str = match.group('date')
                chunk_index = int(match.group('chunk'))
                folder_uuid = match.group('folder_uuid')

                try:
                    metadata = json.loads(blob.download_as_bytes())
                except Exception:
                    logger.warning(f"Could not read/parse {bucket_name}/{blob.name}")
                    total_invalid += 1
                    continue

                serializer = _SERIALIZERS[chunk_type](data=metadata)
                if not serializer.is_valid():
                    logger.warning(
                        f"Invalid metadata for {bucket_name}/{blob.name}: {serializer.errors}"
                    )
                    total_invalid += 1
                    continue
                data = serializer.validated_data
                uuid = data['uuid']

                if uuid != folder_uuid:
                    logger.warning(
                        f"uuid mismatch for {bucket_name}/{blob.name}: "
                        f"path={folder_uuid!r} metadata={uuid!r} - skipping"
                    )
                    total_invalid += 1
                    continue

                model = EdgePrediction if chunk_type == StonesDetectionChunk.TYPE_PREDICTIONS else EdgeCoverage
                if model.objects.filter(uuid=uuid).exists():
                    total_skipped_existing += 1
                    continue

                if dry_run:
                    logger.info(f"[dry-run] would create {model.__name__} uuid={uuid} from {blob.name}")
                    user_created += 1
                    total_created += 1
                    continue

                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                gcs_path = f'{user.username}/{date_str}/{chunk_index}/{chunk_type}/'

                chunk_obj, _ = StonesDetectionChunk.objects.get_or_create(
                    user=user,
                    date=parsed_date,
                    chunk=chunk_index,
                    type=chunk_type,
                    defaults={
                        'gcs_path': gcs_path,
                        'processing_start_date': _processing_start(parsed_date, chunk_index),
                        'status': _BACKFILL_STATUS[chunk_type],
                    },
                )

                image_rel_path = blob.name[: -len('.json')] + '.jpg'
                gprmc_str = data.get('gprmc')
                fix = parse_gprmc(gprmc_str)
                common_fields = dict(
                    uuid=uuid,
                    chunk=chunk_obj,
                    serial=data['serial'],
                    version=data.get('version', '1'),
                    gprmc=gprmc_str,
                    image_path=image_rel_path,
                    location=fix.location,
                    captured_at=fix.captured_at,
                    speed=fix.speed,
                )

                try:
                    if chunk_type == StonesDetectionChunk.TYPE_PREDICTIONS:
                        EdgePrediction.objects.create(
                            **common_fields,
                            model_name=data.get('model_name'),
                            time_since_boot_sec=data.get('time_since_boot_sec'),
                            predictions=data.get('predictions', []),
                        )
                    else:
                        EdgeCoverage.objects.create(**common_fields)
                except Exception:
                    logger.exception(f"DB write failed for {bucket_name}/{blob.name}")
                    total_invalid += 1
                    continue

                user_created += 1
                total_created += 1

            logger.info(f"user={user.username}: created {user_created} row(s)")

            if limit is not None and total_created >= limit:
                logger.info(f"Reached --limit {limit}, stopping.")
                break

        logger.info(
            f"Done. dry_run={dry_run} created={total_created} "
            f"skipped_existing={total_skipped_existing} invalid={total_invalid}"
        )
