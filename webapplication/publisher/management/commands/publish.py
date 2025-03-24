import logging
import fcntl
import os
import os.path
import re
import tempfile
from pathlib import Path
from typing import List, Optional

from django.core.management.base import BaseCommand
from django.conf import settings
from publisher.management.commands._File import FileFactory
from publisher.models import Result
from aoi.models import Request


logger = logging.getLogger(__name__)

def instance_already_running(label='default'):
    """
    Detect if an instance is already running.
    """
    path = os.path.join(tempfile.gettempdir(), f'instance_{label}.lock')
    open(path, 'w+').close() if not os.path.exists(path) else None

    lock_file_pointer = os.open(path, os.O_WRONLY)
    try:
        fcntl.lockf(lock_file_pointer, fcntl.LOCK_EX | fcntl.LOCK_NB)
        already_running = False
    except IOError:
        already_running = True

    return already_running

class Command(BaseCommand):
    help = 'Publisher polls results folder every 60 sec and updates results table'

    def handle(self, *args, **options):
        if instance_already_running('publish'):
            return
        self.file_factory = FileFactory(settings.RESULTS_FOLDER)
        self.tiles_folder = settings.TILES_FOLDER
        self.results_folder = settings.RESULTS_FOLDER
        self.scan()

    def scan(self):
        files = self._read()
        logger.info("started _update_or_create")
        self._update_or_create(files)
        logger.info("finished _update_or_create")
        logger.info("started _clean")
        self._clean(files)
        logger.info("finished _clean")
        logger.info("started _delete")
        self._delete()
        logger.info("finished _delete")
    
    def _get_active_requests_ids(self) -> List[int]:
        """Return a list of folders, affiliated with active requests"""
        active_requests_ids = Request.objects.filter(started_at__isnull=False) \
                                            .filter(finished_at__isnull=True) \
                                            .filter(calculated=False) \
                                            .values_list('id', flat=True)
        return active_requests_ids
    
    def _get_request_id_from_path(self, path:str) -> Optional[int]:
        id_regex = re.compile("(?<=request_)\d+")
        try:
            request_id = int(id_regex.search(path).group())
        except AttributeError:
            request_id = None
        return request_id
    
    def _read(self):
        """Scan result folder of given request and read files
        Returns:
            List[File]:
        """
        logger.info(f"Reading files in {self.results_folder} folder...")
        exclude_dirs = ['.ipynb_checkpoints', ]
        files = list()
        active_requests_ids = self._get_active_requests_ids()
        for dirpath, dirs, filenames in os.walk(self.results_folder):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            request_id = self._get_request_id_from_path(dirpath)
            if request_id in active_requests_ids : continue
            request = Request.objects.filter(pk=request_id).first()
            for file in filenames:
                path = os.path.abspath(os.path.join(dirpath, file))
                try:
                    f = self.file_factory.get_file_obj(path, request)
                    if f:
                        files.append(f)
                except Exception as ex:
                    logger.error(f"Error read {path}: {str(ex)}")
        logger.info(f"Read {len(files)} files")
        return files

    def _update_or_create(self, files):
        """Check if result file was updated or does not exist in db as Result,
        (re)generate tiles and create Result instance if needed
        Args:
            files (List[File]): List of files to check
        """

        logger.info(f"Updating or creating files...")
        for file in files:
            if "_original.gpx" in file.filepath():
                continue
            file_dict = file.as_dict()
            logger.info(f"Working with... {file.filepath()}")
            result = Result.objects.filter(filepath=file.filepath())
            if len(result) > 0:
                logger.info(f"... {len(result) > 0}")
                result = result[0]
                logger.info(f"... {result}")
                if result.modifiedat < file.modifiedat():
                    logger.info(f"... result.modifiedat < file.modifiedat() {result.modifiedat < file.modifiedat()}")
                    file.read_file()
                    logger.info(f"... read_file()")
                    file.delete_tiles(self.tiles_folder)
                    logger.info(f"... delete_tiles")
                    file.generate_tiles(self.tiles_folder)
                    logger.info(f"... generate_tiles")
                    file_dict = file.as_dict()
                    logger.info(f"... as_dict")
                    try:
                        Result.objects.filter(id=result.id).update(**file_dict)
                        logger.info(f"Object {file_dict['filepath']} was UPDATED")
                    except Exception as ex:
                        logger.error(f'Error when updating Result from file_dict = {file_dict}\n {str(ex)}')
                        continue
            else:
                logger.info(f"... {len(result) > 0}")
                file.read_file()
                logger.info(f"... read_file()")
                file.generate_tiles(self.tiles_folder)
                logger.info(f"... generate_tiles()")
                file_dict = file.as_dict()
                logger.info(f"... file.as_dict()()")
                try:
                    Result.objects.create(**file_dict)
                    logger.info(f"Object {file_dict['filepath']} was CREATED")
                except Exception as ex:
                    logger.error(f'Error when creating Result from file_dict = {file_dict}\n {str(ex)}')
                    continue

    def _clean(self, files):
        """"Delete tiles from tiles folder and Results from DB
        for result deleted from its result folder
        Args:
            files (List[File]): list of files - results of current request iteration
        """

        filepaths = [file.filepath() for file in files]
        to_delete = Result.objects.exclude(filepath__in=filepaths)

        logger.info(f"Deleting {to_delete.count()} objects. Paths: "
                    f"{[file.filepath for file in to_delete]} excluding "
                    f"{[file.filepath() for file in files]}")
        try:
            logger.info(f"Deleting {to_delete.count()} tiles.")

            for result in to_delete:
                filepath = os.path.join(self.results_folder, result.filepath)
                f = self.file_factory.get_file_obj(filepath, result.request)
                f.delete_tiles(self.tiles_folder)
            logger.info("Deleting tiles finished")

            to_delete.delete()
            
        except Exception as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting finished")

    def _delete(self):
        """Delete results&titles of all results, marked as to_be_deleted"""

        to_delete = Result.objects.filter(to_be_deleted=True)
        try:
            for result in to_delete:
                filepath = os.path.join(self.results_folder, result.filepath)
                f = self.file_factory.get_file_obj(filepath)
                f.delete_tiles(self.tiles_folder)
                Path.unlink(Path(filepath))
                try:
                    os.rmdir(Path(filepath).parent)
                except OSError:
                    pass
            logger.info("Deleting tiles finished")

            to_delete.delete()

        except OSError as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting results files finished")
