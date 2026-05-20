import logging
from datetime import datetime, timezone

from aoi.models import Component, Request
from django.core.management.base import BaseCommand

from user.models import StonesDetectionChunk

logger = logging.getLogger(__name__)

GPX_COMPONENT_NAME = "Edge Detection Assembler"


class Command(BaseCommand):
    help = "Create GPX Requests for prediction chunks whose 4-hour window just closed."

    def handle(self, *args, **options):
        boundary = datetime.now(tz=timezone.utc).replace(
            minute=0, second=0, microsecond=0
        )

        chunks = StonesDetectionChunk.objects.filter(
            type=StonesDetectionChunk.TYPE_PREDICTIONS,
            processing_start_date__lte=boundary,
            status__in=[StonesDetectionChunk.STATUS_UPLOADING, StonesDetectionChunk.STATUS_PENDING],
        ).select_related("user")

        if not chunks.exists():
            logger.info(f"No pending prediction chunks at boundary {boundary.isoformat()}.")
            return

        try:
            component = Component.objects.get(name=GPX_COMPONENT_NAME)
        except Component.DoesNotExist:
            logger.error(
                f'Component "{GPX_COMPONENT_NAME}" not found. '
                "Register it in the admin before running this command."
            )
            return

        created = 0
        skipped = 0

        for chunk in chunks:
            user = chunk.user
            if not user or not user.stones_storage_edge:
                logger.warning(
                    f"Skipping chunk pk={chunk.pk}: user has no stones_storage_edge."
                )
                skipped += 1
                continue

            # GOOGLE_BUCKET_PATH = "<bucket>/<user>/<date>/<chunk>/"
            # bucket_prefix_from_env() in the component splits this on the first "/"
            base_path = f"{user.username}/{chunk.date}/{chunk.chunk}/"
            gcs_path = f"{user.stones_storage_edge}/{base_path}"

            gpx_request = Request.objects.create(
                user=user,
                component=component,
                aoi=None,
                polygon=None,
                additional_parameter=gcs_path,
            )

            chunk.status = StonesDetectionChunk.STATUS_PROCESSING
            chunk.gpx_request = gpx_request
            chunk.save(update_fields=["status", "gpx_request"])

            logger.info(f"Created Request for chunk pk={chunk.pk} → gs://{gcs_path}")
            created += 1

        logger.info(
            f"Done. boundary={boundary.isoformat()} "
            f"created={created} skipped={skipped}"
        )
