# python 3.6
import argparse
import json
import logging
import os
import sys

from datetime import datetime
from subprocess import Popen, PIPE, TimeoutExpired

parser = argparse.ArgumentParser(description='Script for edit and execute notebook')
parser.add_argument('--input_path', type=str, help='Path to an original notebook', required=True)
parser.add_argument('--kernel', type=str, help='Kernel name', default='python38')
parser.add_argument('--cell_timeout', type=int, help='Max execution time (sec) for cell', required=True)


logger = logging.getLogger(__name__)


class NotebookExecutor:
    def __init__(self, args):
        self.input_path = args.input_path
        self.cell_timeout = args.cell_timeout
        self.kernel_name = args.kernel
        self.notebook = self.read()

    def edit(self):
        self._first_code_cell()['source'] += "\n\n# added by backend notebook_executor.py script:" \
                                             "\n" + self._build_params()
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

    def execute(self):
        command = ["jupyter",
                   "nbconvert",
                   "--inplace",
                   "--to=notebook",
                   "--execute",
                   self.input_path,
                #    "--allow-errors",
                   "--ExecutePreprocessor.timeout",
                   str(self.cell_timeout), ]

        if self.kernel_name:
            command.append(f"--ExecutePreprocessor.kernel_name={self.kernel_name}")

        process = Popen(command, stdout=PIPE, stderr=PIPE, encoding="utf-8")

        try:
            out, err = process.communicate(timeout=10000)
            if process.returncode != 0:
                raise RuntimeError(f"Failed {command}\nOutput: {out}, err: {err}")
        except TimeoutExpired as te:
            logger.error(f"Failed {command} error: {str(te)}. Killing process...")
            process.kill()
            out, err = process.communicate()
            logger.error(f"Failed {command} output: {out}, err: {err}")
            raise


if __name__ == "__main__":
    args = parser.parse_args()
    notebook_executor = NotebookExecutor(args)
    # notebook_executor.edit()
    try:
        notebook_executor.execute()
    except:
        logger.exception("Exited from NotebookExecutor")
        sys.exit(1)
    sys.exit(0)
