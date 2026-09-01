import logging

from django.core.management.base import BaseCommand

from user.models import EdgeCoverage, EdgePrediction
from user.stone_device_views import parse_gprmc

logger = logging.getLogger(__name__)

BATCH_SIZE = 500

MODELS = [EdgeCoverage, EdgePrediction]


class Command(BaseCommand):
    help = (
        "Backfill captured_at and speed on EdgeCoverage/EdgePrediction rows. "
        "Re-parse each row's stored gprmc string. Do not change location. "
        "Safe to run again: it always recomputes the values, so it also "
        "fixes rows if the parser logic changes later."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Report what would be updated without writing anything',
        )
        parser.add_argument(
            '--limit', type=int, default=None,
            help='Process at most this many rows per model. '
                 'Use --limit 5 to test the command on a small sample first.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']

        for model in MODELS:
            self._backfill_model(model, dry_run, limit)

    def _backfill_model(self, model, dry_run, limit):
        queryset = (
            model.objects
            .exclude(gprmc__isnull=True)
            .exclude(gprmc='')
            .only('pk', 'gprmc')
        )
        if limit is not None:
            queryset = queryset[:limit]

        updated = 0
        invalid = 0
        batch = []

        for row in queryset.iterator():
            fix = parse_gprmc(row.gprmc)

            # "Invalid" means the fix was not valid, or could not be
            # parsed. Both fields stay None in that case. A blank speed
            # value alone is not invalid.
            if fix.captured_at is None and fix.speed is None:
                invalid += 1
            else:
                updated += 1

            if dry_run:
                continue

            row.captured_at = fix.captured_at
            row.speed = fix.speed
            batch.append(row)

            if len(batch) >= BATCH_SIZE:
                model.objects.bulk_update(batch, ['captured_at', 'speed'])
                batch = []

        if not dry_run and batch:
            model.objects.bulk_update(batch, ['captured_at', 'speed'])

        logger.info(
            f"{model.__name__}: dry_run={dry_run} updated={updated} "
            f"invalid_or_unparseable={invalid}"
        )
