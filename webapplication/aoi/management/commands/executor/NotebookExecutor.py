# python 3.6
import json
import logging
import os
import sys
from pathlib import Path
from shutil import copytree, ignore_patterns

from datetime import datetime
from subprocess import Popen, PIPE, TimeoutExpired

logger = logging.getLogger(__name__)


class NotebookExecutor:
    def __init__(self):
        self.input_path = os.getenv('NOTEBOOK_PATH')
        self.request_id = os.getenv('REQUEST_ID')
        self.output_folder = os.getenv('OUTPUT_FOLDER')

        self.PARAMS = dict(REQUEST_ID=self.request_id,
                           START_DATE=os.getenv('START_DATE'),
                           END_DATE=os.getenv('END_DATE'),
                           AOI=os.getenv('AOI'),
                           SENTINEL2_GOOGLE_API_KEY=os.getenv('SENTINEL2_GOOGLE_API_KEY'),
                           SENTINEL2_CACHE=os.getenv('SENTINEL2_CACHE'),
                           OUTPUT_FOLDER=self.output_folder                          
                           )
        
        additional_parameter_name = os.getenv('ADDITIONAL_PARAMETER_NAME')
        if additional_parameter_name:
            self.PARAMS.update(
                {
                    additional_parameter_name:os.getenv(additional_parameter_name)
                }
            )

        self.cell_timeout = int(os.getenv('CELL_TIMEOUT'))
        self.notebook_timeout = int(os.getenv('NOTEBOOK_TIMEOUT'))
        self.kernel_name = os.getenv('KERNEL_NAME')
        self.notebook = self.read()

        timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
        self.save_path =os.path.join(self.output_folder, 'notebook', f"{Path(self.input_path).stem}_{timestamp}.ipynb")

    def edit(self):
        self._first_code_cell()['source'] += "\n\n# added by backend notebook_executor.py script:" \
                                             "\n" + self._build_params()
        self.copy_aux_files()
        self.write()

    def _first_code_cell(self):
        for cell in self.notebook['cells']:
            if cell['cell_type'] == 'code':
                return cell

    def _build_params(self):
        return "\n".join(f"{name} = {value!r}" for name, value in self.PARAMS.items())

    def read(self):
        with open(self.input_path) as file:
            notebook = json.load(file)
        return notebook

    def write(self):
        with open(self.save_path, "w") as file:
            json.dump(self.notebook, file)

    def copy_aux_files(self) -> None:
        """Copy everything from initial notebook folder to result folder
            in order to serve all auxillary files&folder notebook requires.
            Does not copy:
            - notebook itself
            - .ipynb_checkpoints folder
        """
        copytree(
            os.path.dirname(self.input_path), 
            os.path.dirname(self.save_path),
            ignore=ignore_patterns('.ipynb_checkpoints', os.path.basename(self.input_path))
        )

    def execute(self):
        command = ["jupyter",
                   "nbconvert",
                   "--inplace",
                   "--to=notebook",
                   "--execute",
                   self.save_path,
                   "--allow-errors",
                   "--ExecutePreprocessor.timeout",
                   str(self.cell_timeout), ]

        if self.kernel_name:
            command.append(f"--ExecutePreprocessor.kernel_name={self.kernel_name}")

        process = Popen(command, stdout=PIPE, stderr=PIPE, encoding="utf-8")

        try:
            out, err = process.communicate(timeout=self.notebook_timeout)
            if process.returncode != 0:
                raise RuntimeError(f"Failed {command}\nOutput: {out}, err: {err}")
        except TimeoutExpired as te:
            logger.error(f"Failed {command} error: {str(te)}. Killing process...")
            process.kill()
            out, err = process.communicate()
            logger.error(f"Failed {command} output: {out}, err: {err}")
            raise


if __name__ == "__main__":
    notebook_executor = NotebookExecutor()
    notebook_executor.edit()
    try:
        notebook_executor.execute()
    except:
        logger.exception("Exited from NotebookExecutor")
        sys.exit(1)
    sys.exit(0)
