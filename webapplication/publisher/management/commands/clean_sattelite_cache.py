import logging
from pathlib import Path
from datetime import datetime, timedelta
from django.conf import settings
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Cleanup old_sattelite_cache_periodically'

    def handle(self, *args, **options):
        logger.info('starting to search old satellite images')
        self.delete_old_files(settings.SATELLITE_IMAGES_FOLDER)

    @staticmethod
    def delete_old_files(path):
        search_path = Path(path)
        files = search_path.glob('*.*')
        for file in files:
            if file.stat().st_size > 0:
                st_mtime = file.stat().st_mtime  # time of last modification
                last_modification_date = datetime.fromtimestamp(st_mtime)
                logger.info(f'last_modification_date: {last_modification_date}, file: {file}')
                if last_modification_date + timedelta(days=settings.STORE_SATELLITE_IMAGES_DAYS) < datetime.today():
                    logger.info(f'deleting {file}')
                    file.unlink()
