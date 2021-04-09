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
parser.add_argument('--request_id', type=int, help='Request id', required=True)
parser.add_argument('--aoi', type=str, help='AOI polygon as WKT string', required=True)
parser.add_argument('--start_date', type=str, help='Start date of calculations', required=True)
parser.add_argument('--end_date', type=str, help='End date of calculations', required=True)
parser.add_argument('--kernel', type=str, help='Kernel name', default=None)
parser.add_argument('--cell_timeout', type=int, help='Max execution time (sec) for cell', required=True)
parser.add_argument('--notebook_timeout', type=int, help='Max execution time (sec) for full notebook process',
                    required=True)

logger = logging.getLogger(__name__)


class NotebookExecutor:
    def __init__(self, args):
        self.input_path = f'/home/jovyan/{args.input_path}'
        self.request_id = args.request_id

        self.PARAMS = dict(REQUEST_ID=args.request_id,
                           AOI=args.aoi,
                           START_DATE=args.start_date if args.start_date != 'None' else None,
                           END_DATE=args.end_date if args.end_date != 'None' else None)

        self.cell_timeout = args.cell_timeout
        self.notebook_timeout = args.notebook_timeout
        self.kernel_name = args.kernel
        self.notebook = self.read()

        timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
        self.save_path = f"{os.path.splitext(self.input_path)[0]}_{self.request_id}_{timestamp}.ipynb"

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
    args = parser.parse_args()
    notebook_executor = NotebookExecutor(args)
    notebook_executor.edit()
    try:
        notebook_executor.execute()
    except:
        logger.exception("Exited from NotebookExecutor")
        sys.exit(1)
    sys.exit(0)
