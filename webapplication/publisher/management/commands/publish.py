import logging
import fcntl
import os
import os.path
import tempfile
from pathlib import Path

from django.core.management.base import BaseCommand
from django.conf import settings
from publisher.management.commands._File import FileFactory
from publisher.models import Result

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
    for dirpath, _, _, in os.walk(folder, topdown=False):
        if dirpath != folder:
            try:
                os.rmdir(dirpath)
            except OSError:
                pass


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
        self._update_or_create(files)
        self._clean(files)
        self._delete()

    def _read(self):
        logger.info(f"Reading files in {self.results_folder} folder...")
        exclude = ['.ipynb_checkpoints', ]
        files = list()
        for dirpath, dirs, filenames in os.walk(self.results_folder):
            dirs[:] = [d for d in dirs if d not in exclude]
            for file in filenames:
                path = os.path.abspath(os.path.join(dirpath, file))
                try:
                    f = self.file_factory.get_file_obj(path)
                    if f:
                        files.append(f)
                except Exception as ex:
                    logger.error(f"Error read {path}: {str(ex)}")
        logger.info(f"Read {len(files)} files")
        return files

    def _update_or_create(self, files):
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

    def _clean(self, files):
        filepaths = [file.filepath() for file in files]
        to_delete = Result.objects.exclude(filepath__in=filepaths)

        logger.info(f"Deleting {to_delete.count()} objects. Paths: "
                    f"{[file.filepath for file in to_delete]}")
        try:
            logger.info(f"Deleting {to_delete.count()} tiles.")

            for result in to_delete:
                filepath = os.path.join(self.results_folder, result.filepath)
                f = self.file_factory.get_file_obj(filepath)
                f.delete_tiles(self.tiles_folder)

            logger.info("Deleting tiles finished")

            to_delete.delete()

            rm_empty_dirs(self.tiles_folder)
        except Exception as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting finished")

    def _delete(self):
        to_delete = Result.objects.filter(to_be_deleted=True)
        try:
            for result in to_delete:
                filepath = os.path.join(self.results_folder, result.filepath)
                f = self.file_factory.get_file_obj(filepath)
                f.delete_tiles(self.tiles_folder)
                Path.unlink(Path(filepath))

            logger.info("Deleting tiles finished")

            to_delete.delete()

            rm_empty_dirs(self.tiles_folder)

        except OSError as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting results files finished")
