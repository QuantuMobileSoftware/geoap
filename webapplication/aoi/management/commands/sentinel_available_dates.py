import logging
from aoi.models import AoI

from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Update sentinel images dates"

    def handle(self, *args, **options):
        logger.info("starting to update sentinel images dates")
        all_aoi = AoI.objects.all()
        for aoi in all_aoi:
            aoi_polygon = aoi.polygon.wkt
            sentinel_dates = AoI.get_available_image_dates(aoi_polygon)
            aoi.available_dates = sentinel_dates
            aoi.save(update_fields=['available_dates'])
        logger.info("finished to update sentinel images dates")
