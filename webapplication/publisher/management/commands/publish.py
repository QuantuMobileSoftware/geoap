import logging
import fcntl
import os
import os.path
import shutil
import itertools
import tempfile
from pathlib import Path
from typing import List

from django.core.management.base import BaseCommand
from django.conf import settings

from publisher.management.commands._File import FileFactory, File

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


def rm_empty_dirs(folder):
    """
       Remove empty dirs and sub dirs
    """
    logger.info(f'Removing of empty directories in {folder} started ')
    command = ["find", folder, "-mindepth", "1", "-empty", "-type", "d", "-delete"]
    File.run_process(command, settings.MAX_TIMEOUT_FOR_FOLDER_CLEANING)
    logger.info(f'Removing of empty directories in {folder} finished ')
    return


class Command(BaseCommand):
    help = 'Publisher polls results folder every 60 sec and updates results table'

    def add_arguments(self, parser):
        parser.add_argument('request', nargs=1, type=int)

    def handle(self, *args, **options):
        if instance_already_running(f"publish_{options['request'][0]}"):
            return
        
        logger.info(f"Starting publish sequence for request #{options['request'][0]}")
        self.request = Request.objects.get(pk=options['request'][0])
        self.results_folder = os.path.join(settings.RESULTS_FOLDER, str(self.request.pk))
        self.file_factory = FileFactory(settings.RESULTS_FOLDER, self.request)
        self.tiles_folder = settings.TILES_FOLDER
        self.base_folder = settings.RESULTS_FOLDER

        self.exclude_dirs = ['.ipynb_checkpoints']
        self.exclude_file_extensions = ['.ipynb']
        os.makedirs(self.tiles_folder, exist_ok=True)
        self.do_stuff()

    def do_stuff(self):
        """Main logic"""
        
        files = self._read()
        self._update_or_create(files)
        self._clean(files)
        self._delete()
        self._rm_empty_dirs(self.base_folder)
        self._rm_empty_dirs(self.results_folder)

    def _read(self) -> List[File]:
        """Scan result folder of given request and read files

        Returns:
            List[File]:
        """

        logger.info(f"Reading files in {self.results_folder} folder...")
        files= list() 
        filepaths = self._scan_folder(self.results_folder)
        for file in filepaths:
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

    def _scan_folder(self, folder:str) -> List[str]:
        """Scan given folder and return filepaths of all files in it.
        Exclude files with extensions self.exclude_file_extensions
        Exclude files from folders self.exclude_dirs

        Args:
            folder (str): Folder to scan

        Returns:
            List[str]: List of full filenames in given dirs
        """

        nested_file_list = [[os.path.join(folder, file) 
            for file in files if not Path(file).suffix in self.exclude_file_extensions] 
                for folder, _, files in os.walk(folder) if files and folder not in self.exclude_dirs]
        return [f for f in itertools.chain(*nested_file_list)]
    
    def _clean(self, files: List[File]):
        """"Delete tiles from folder and Results from DB
        if result was deleted from its folder
        Args:
            files (List[File]): list of files - results of current request iteration
        """
    
        all_filepaths = [f[len(self.base_folder)+1:] for f in self._scan_folder(self.base_folder)]
        all_filepaths.extend([file.filepath() for file in files])
        filepaths = list(set(all_filepaths))
        to_delete = Result.objects.exclude(filepath__in=filepaths)
        logger.info(f"Deleting {to_delete.count()} objects. Paths: "
                    f"{[file.filepath for file in to_delete]}")
        try:
            logger.info(f"Deleting {to_delete.count()} tiles.")
            for result in to_delete:
                filepath = os.path.join(self.base_folder, result.filepath)
                f = self.file_factory.get_file_obj(filepath)
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
                filepath = os.path.join(self.base_folder, result.filepath)
                result_dir = os.path.join(self.base_folder, str(result.request.pk))
                f = self.file_factory.get_file_obj(filepath)
                f.delete_tiles(self.tiles_folder)
                shutil.rmtree(result_dir, ignore_errors=True)
            logger.info("Deleting tiles finished")
            to_delete.delete()
        except OSError as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting results files finished")

    def _rm_empty_dirs(self, folder:str):
        """Remove empty folders inside given folder that
         not belong to currently executing requests

        Args:
            folder (str)
        """
        active_requests_id = Request.objects.filter(started_at__isnull=False) \
                                            .exclude(finished_at__isnull=True) \
                                            .values_list('id', flat=True)
        active_request_affiliated_folders = [os.path.join(folder, str(r)) for r in active_requests_id]
        empty_folders = [dir for dir, subdirs, files in os.walk(folder) 
                    if not bool(subdirs) and not bool(files) and dir != folder]
        for check_folder in empty_folders:
            if [f for f in active_request_affiliated_folders if check_folder.startswith(f)]:continue
            shutil.rmtree(check_folder, ignore_errors=True)
    