import logging
import fcntl
import os
import os.path
import shutil
import tempfile
import time

from subprocess import Popen, PIPE, TimeoutExpired
from django.core.management.base import BaseCommand
from ._File import Geojson, Geotif
from ...models import Result


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
        self.scan(options['path'])

    def add_arguments(self, parser):
        parser.add_argument(
            '-p',
            '--path',
            default='./data/results',
            type=str,
            help='Path to results folder, default: ./data/results'
        )

    def scan(self, results_folder):
        files = self._read(results_folder)
        self._update_or_create(files)
        self._clean(files)

    def _read(self, results_folder):
        logger.info(f"Reading files in {results_folder} folder...")
        files = list()
        for dirpath, _, filenames in os.walk(results_folder):
            for file in filenames:
                path = os.path.abspath(os.path.join(dirpath, file))
                try:
                    if file.endswith('.geojson'):
                        f = Geojson(path, results_folder)
                        files.append(f)
                    if file.endswith(('.tif', '.tiff')):
                        f = Geotif(path, results_folder)
                        files.append(f)
                except Exception as ex:
                    logger.error(f"Error read {path}: {str(ex)}")
        logger.info(f"Read {len(files)} files")
        return files

    def _update_or_create(self, files):
        logger.info(f"Updating or creating files...")
        for file in files:
            file_dict = file.as_dict()
            try:
                try:
                    result = Result.objects.get(filepath=file_dict['filepath'])
                    if result.modifiedat < file_dict['modifiedat']:
                        Result.objects.filter(id=result.id).update(**file_dict)
                        self.to_xyz(file)
                        logger.info(f"Object {file_dict['filepath']} was UPDATED")
                except Result.DoesNotExist:
                    Result.objects.create(**file_dict)
                    self.to_xyz(file)
                    logger.info(f"Object {file_dict['filepath']} was CREATED")
            except Exception as ex:
                logger.error(f"Error for {file_dict['filepath']}: {str(ex)}")
        logger.info(f"Updating or creating finished")

    def _clean(self, files):
        filepaths = [file.filepath() for file in files]
        to_delete = Result.objects.exclude(filepath__in=filepaths)
        xyz_delete = to_delete.filter(layer_type=Result.XYZ)

        logger.info(f"Deleting {to_delete.count()} objects. FILEPATHS: "
                          f"{[file.filepath for file in to_delete]}")
        try:
            self._delete_xyz_tile(xyz_delete)
            to_delete.delete()
        except Exception as ex:
            logger.error(f"Error deleting: {str(ex)}")
        logger.info(f"Deleting finished")

    def to_xyz(self, file, timeout=60 * 5, sleep=5,
               folder="./data/tiles/"):
        if file.layer_type() != Result.XYZ:
            return

        abs_path = file.path
        save_path = f"{folder}{file.filepath().split('.')[0]}"
        logger.info(f"Generating xyz tile for {abs_path}")

        command = ["gdal2tiles.py", "--xyz", "--webviewer=none", "--zoom=10-16", abs_path, save_path, ]

        process = Popen(command, stdout=PIPE)
        try:
            out, err = process.communicate(timeout=timeout)
            logger.info(f"Process output:\n{out.decode('utf-8')}\nProcess err: {err}")
            self._poll_process(process, sleep)
        except TimeoutExpired as te:
            logger.error(f"Process error: {str(te)}. Killing process...")
            process.kill()
            self._poll_process(process, sleep)

    def _poll_process(self, process, sleep):
        while True:
            code = process.poll()
            if code == 0 or code:
                logger.info(f"Process was finished with code: {code}")
                break
            else:
                logger.info(f"Process is running...")
                time.sleep(sleep)

    def _delete_xyz_tile(self, xyz_delete, folder="./data/tiles/"):
        logger.info(f"Deleting {xyz_delete.count()} xyz tiles...")
        for item in xyz_delete:
            item_dir = item.filepath.split('.')[0]
            delete_dir = f"{folder}{item_dir}"
            logger.info(f"Deleting xyz by path: {delete_dir}")
            try:
                shutil.rmtree(delete_dir)
                rm_empty_dirs(folder)
            except OSError as e:
                logger.error(f"Error: {delete_dir}: {e.strerror}")
        logger.info("Deleting xyz tiles finished")


