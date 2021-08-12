import argparse
import logging
import nbformat
import sys
from pathlib import Path
from datetime import datetime
from nbconvert.preprocessors import ExecutePreprocessor


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class NotebookExecutor:
    def __init__(self, args):
        timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
        self.path_to_execute = Path(args.path_to_execute)
        self.output_path = args.output_path
        self.request_id = args.request_id
        self.notebook_stem = self.path_to_execute.stem
        self.nb_suffix = self.path_to_execute.suffix
        self.save_path = Path(self.output_path) / f'{self.notebook_stem}_{self.request_id}_{timestamp}{self.nb_suffix}'

        self.PARAMS = dict(REQUEST_ID=args.request_id,
                           AOI=args.aoi,
                           START_DATE=args.start_date if args.start_date != 'None' else None,
                           END_DATE=args.end_date if args.end_date != 'None' else None)

        self.cell_timeout = args.cell_timeout
        self.notebook_timeout = args.notebook_timeout
        self.kernel_name = args.kernel
        self.notebook = self.read()
        logger.info(f'path for saving notebook: {self.save_path}')

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
        logger.info(f'Try to open notebook {self.path_to_execute}')
        notebook = nbformat.read(self.path_to_execute, as_version=4)
        logger.info(f'Notebook {self.path_to_execute} was opened successfully')
        return notebook

    def write(self):
        logger.info(f'Try to save notebook in {self.save_path}')
        nbformat.write(self.notebook, str(self.save_path), version=nbformat.NO_CONVERT, )
        logger.info(f'Notebook was saved successfully in {self.save_path}')

    def execute(self):
        ep = ExecutePreprocessor(timeout=self.cell_timeout, kernel_name=self.kernel_name)
        nb, resources = ep.preprocess(self.notebook, {'metadata': {'path': self.path_to_execute.parent}})
        executed_save_path = self.save_path.parent / f'{self.save_path.stem}_executed{self.save_path.suffix}'
        nbformat.write(nb, str(executed_save_path), version=nbformat.NO_CONVERT, )
        
        
def main():
    parser = argparse.ArgumentParser(description='Script for edit and execute notebook')
    parser.add_argument('--path_to_execute', type=str, help='Path to notebook for executing', required=True)
    parser.add_argument('--output_path', type=str, help='Path for saving output notebooks', required=True)
    parser.add_argument('--request_id', type=int, help='Request id', required=True)
    parser.add_argument('--aoi', type=str, help='AOI polygon as WKT string', required=True)
    parser.add_argument('--start_date', type=str, help='Start date of calculations', required=True)
    parser.add_argument('--end_date', type=str, help='End date of calculations', required=True)
    parser.add_argument('--kernel', type=str, help='Kernel name', default=None)
    parser.add_argument('--cell_timeout', type=int, help='Max execution time (sec) for cell', required=True)
    parser.add_argument('--notebook_timeout', type=int, help='Max execution time (sec) for full notebook process',
                        required=True)
    args = parser.parse_args()
    notebook_executor = NotebookExecutor(args)
    if int(args.request_id) > 0:
        notebook_executor.edit()
    try:
        notebook_executor.execute()
    except:
        logger.exception("Exited from NotebookExecutor")
        sys.exit(1)
    sys.exit(0)
    

if __name__ == "__main__":
    main()
