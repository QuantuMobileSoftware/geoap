import logging
import os
import os.path
import shutil

from django.core.management.base import BaseCommand
from django.conf import settings

from publisher.management.commands._File import FileFactory

from publisher.models import Result
from aoi.models import Request
from publisher.management.commands._PublisherHelper import PublisherHelper


logger = logging.getLogger(__name__)

class Command(BaseCommand, PublisherHelper):
    help = 'Cleaning up folders and results'

    def handle(self, *args, **options):
        
        if self.instance_already_running("cleanup"):
            return
        
        self.file_factory = FileFactory(settings.RESULTS_FOLDER)
        self.do_stuff()

    def do_stuff(self):
        """Main logic"""
        
        self._clean()
        self._delete()
        self._rm_empty_dirs(self.base_folder)
        self._rm_empty_dirs(self.tiles_folder)
    

    def _clean(self):
        """"Delete tiles from tiles folder and Results from DB
        for result deleted from its result folder
        Args:
            files (List[File]): list of files - results of current request iteration
        """

        filepaths = [f[len(self.base_folder)+1:] for f in self._scan_folder(self.base_folder)]
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
         not belong to currently executing requests.

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
    

