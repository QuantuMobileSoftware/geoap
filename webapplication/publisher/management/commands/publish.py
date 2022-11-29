import logging
import fcntl
import os
import os.path
import shutil
import itertools
import tempfile
from pathlib import Path
from typing import List, Optional

from django.core.management.base import BaseCommand
from django.conf import settings

from publisher.management.commands._File import FileFactory, File
from publisher.management.commands._PublisherUtils import scan_folder

from publisher.models import Result
from aoi.models import Request

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Publisher polls results folder every 60 sec and updates results table'

    def add_arguments(self, parser):
        parser.add_argument('request', nargs=1, type=int)

    def handle(self, *args, **options):
        logger.info(f"Starting publish sequence for request #{options['request'][0]}")
        self.request = Request.objects.get(pk=options['request'][0])
        self.results_folder = os.path.join(settings.RESULTS_FOLDER, str(self.request.pk))
        self.file_factory = FileFactory(settings.RESULTS_FOLDER, self.request)
        self.tiles_folder = settings.TILES_FOLDER

        self.exclude_dirs = ['.ipynb_checkpoints']
        self.exclude_file_extensions = ['.ipynb']

        os.makedirs(self.tiles_folder, exist_ok=True)
        self.do_stuff()

    def do_stuff(self):
        """Main logic"""
        
        files = self._read()
        self._update_or_create(files)

    def _read(self) -> List[File]:
        """Scan result folder of given request and read files

        Returns:
            List[File]:
        """

        logger.info(f"Reading files in {self.results_folder} folder...")
        files= list() 
        for file in scan_folder(self.results_folder, self.exclude_file_extensions, self.exclude_dirs):
            path = os.path.abspath(file)
            try:
                f = self.file_factory.get_file_obj(path)
                if f:
                    files.append(f)
            except Exception as ex:
                    logger.error(f"Error read {path}: {str(ex)}")
        logger.info(f"Read {len(files)} files")
        return files

    def _update_or_create(self, files:List[File]):
        """Check if result file was updated or does not exist in db as Result,
        (re)generate tiles and create Result instance if needed

        Args:
            files (List[File]): List of files to check
        """
        logger.info(f"Updating or creating files...")
        for file in files:
            file_dict = file.as_dict()
            result = Result.objects.filter(filepath=file.filepath())
            if len(result) > 0:
                result = result[0]
                if result.modifiedat < file.modifiedat():
                    file.read_file()
                    file.delete_tiles(self.tiles_folder)
                    file.generate_tiles(self.tiles_folder)
                    file_dict = file.as_dict()
                    try:
                        Result.objects.filter(id=result.id).update(**file_dict)
                        logger.info(f"Object {file_dict['filepath']} was UPDATED")
                    except Exception as ex:
                        logger.error(f'Error when updating Result from file_dict = {file_dict}\n {str(ex)}')
                        continue
            else:
                file.read_file()
                file.generate_tiles(self.tiles_folder)
                file_dict = file.as_dict()
                try:
                    Result.objects.create(**file_dict)
                    logger.info(f"Object {file_dict['filepath']} was CREATED")
                except Exception as ex:
                    logger.error(f'Error when creating Result from file_dict = {file_dict}\n {str(ex)}')
                    continue

    