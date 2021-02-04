import argparse
import json

parser = argparse.ArgumentParser(description='Script for editing notebook')
parser.add_argument('--input_path', type=str, help='Path to an original notebook', required=True)
parser.add_argument('--output_path', type=str, help='Path to save edited notebook', required=True)
parser.add_argument('--request_id', type=int, help='Request id', required=True)
parser.add_argument('--aoi', type=str, help='AOI polygon as WKT string', required=True)
parser.add_argument('--start_date', type=str, help='Start date of calculations', required=True)
parser.add_argument('--end_date', type=str, help='End date of calculations', required=True)


class NotebookEditor:

    def __init__(self, args):
        self.input_path = args.input_path
        self.output_path = args.output_path

        self.PARAMS = dict(REQUEST_ID=args.request_id,
                           AOI=args.aoi,
                           START_DATE=args.start_date if args.start_date != 'None' else None,
                           END_DATE=args.end_date if args.end_date != 'None' else None )

        self.notebook = self.read()

    def edit(self):
        self._first_code_cell()['source'] +=  "\n\n# added by backend notebook_executor.py script:" \
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
        with open(self.output_path, "w") as file:
            json.dump(self.notebook, file)


if __name__ == '__main__':
    args = parser.parse_args()
    notebook_editor = NotebookEditor(args)
    notebook_editor.edit()
