import logging
from aoi.models import AoI
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone

from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update sentinel images dates"

    def handle(self, *args, **options):
        logger.info("starting to update sentinel images dates")
        one_week_ago = timezone.now() - timedelta(days=7)
        filtered_aoi = AoI.objects.filter(
            Q(sentinel_hub_available_dates_update_time__isnull=True) |
            Q(sentinel_hub_available_dates_update_time__lt=one_week_ago)
        )
        for aoi in filtered_aoi:
            aoi_polygon = aoi.polygon.wkt
            sentinel_dates = AoI.get_available_image_dates(aoi_polygon)
            aoi.sentinel_hub_available_dates = sentinel_dates
            aoi.sentinel_hub_available_dates_update_time = timezone.now()
            aoi.save(update_fields=['sentinel_hub_available_dates', 'sentinel_hub_available_dates_update_time'])
        logger.info("finished to update sentinel images dates")
