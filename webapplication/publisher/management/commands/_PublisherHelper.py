import itertools
import logging
import os
import tempfile
import fcntl
from pathlib import Path
from typing import List


from django.conf import settings

logger = logging.getLogger(__name__)

class PublisherHelper:
    """Helper class to posses common logic and static variables
    for `publish` and `cleanup` commands"""

    exclude_dirs = ['.ipynb_checkpoints']
    exclude_file_extensions = ['.ipynb']
    tiles_folder = settings.TILES_FOLDER
    base_folder = settings.RESULTS_FOLDER

    @staticmethod
    def _scan_folder(folder:str) -> List[str]:
        """Scan given folder and return filepaths of all files in it.
        Exclude files with extensions `exclude_file_extensions`
        Exclude files from folders `exclude_dirs`

        Args:
            folder (str): Folder to scan

        Returns:
            List[str]: List of full filenames in given dirs
            
        """

        nested_file_list = [[os.path.join(folder, file) 
            for file in files if not Path(file).suffix in PublisherHelper.exclude_file_extensions] 
                for folder, _, files in os.walk(folder) if files and folder not in PublisherHelper.exclude_dirs]
        return [f for f in itertools.chain(*nested_file_list)]\

    @staticmethod
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