import itertools
import logging
import os
import tempfile
import fcntl
from pathlib import Path
from typing import List, Optional


logger = logging.getLogger(__name__)

def scan_folder(
            folder:str,
            exclude_file_extensions: Optional[List[str]]=['.ipynb_checkpoints'],
            exclude_dirs: Optional[List[str]]=['.ipynb']
        ) -> str:
    """Scan given folder and return filepaths of all files in it.

    Args:
        folder (str): Folder to scan
        exclude_file_extensions (Optional[List[str]], optional): List of extensions to exclude from result.
        exclude_dirs (Optional[List[str]], optional): List of directories to exclude from result.

    Yields:
        Iterator[str]: File's full path
    """
        
    for folder, _, files in os.walk(folder):
        if not files or folder in exclude_dirs: continue
        for file in files:
            if Path(file).suffix in exclude_file_extensions: continue
            yield os.path.join(folder, file) 


class CommandOnyOneInstanceViaFileLock():

    def instance_already_running(self):
        """
        Detect if an instance is already running.
        """
        label = self.__dict__.get('label', self.__class__.__name__)
        path = os.path.join(tempfile.gettempdir(), f'instance_{label}.lock')
        open(path, 'w+').close() if not os.path.exists(path) else None

        lock_file_pointer = os.open(path, os.O_WRONLY)
        try:
            fcntl.lockf(lock_file_pointer, fcntl.LOCK_EX | fcntl.LOCK_NB)
            already_running = False
        except IOError:
            already_running = True

        return already_running