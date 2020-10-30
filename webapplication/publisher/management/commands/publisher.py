import copy
import os

from django.core.management.base import BaseCommand
from ._File import Geojson, Geotif
from ...models import Results


class Command(BaseCommand):
    help = 'Publisher polls results folder every 60 sec and updates results table'

    def handle(self, *args, **options):
        self.scan(options['path'])

    def add_arguments(self, parser):
        parser.add_argument(
            '-p',
            '--path',
            default="./data/results",
            type=str,
            help='Path to results folder, default: ./data/results'
        )

    def scan(self, results_folder):
        files = self._read(results_folder)
        self._update_or_create(files)
        self._clean(files)

    def _read(self, results_folder):
        self.stdout.write(f"Reading files in {results_folder} folder...")
        files = list()
        for dirpath, _, filenames in os.walk(results_folder):
            for file in filenames:
                path = os.path.abspath(os.path.join(dirpath, file))
                try:
                    if file.endswith('.geojson'):
                        f = Geojson(path)
                        files.append(f)
                    if file.endswith(('.tif', '.tiff')):
                        f = Geotif(path)
                        files.append(f)
                except Exception as ex:
                    self.stderr.write(f"Error read {path}: {str(ex)}")
        self.stdout.write(f"Read {len(files)} files")
        return files

    def _update_or_create(self, files):
        self.stdout.write(f"Updating or creating files...")
        for file in files:
            file_dict = file.as_dict()
            try:
                defaults = copy.deepcopy(file_dict)
                defaults.pop('filename')
                obj, created = Results.objects.update_or_create(filename=file_dict['filename'],
                                                                defaults=defaults)
                if created:
                    self.stdout.write(f"Object {obj.filename} was CREATED")
                else:
                    self.stdout.write(f"Object {obj.filename} was UPDATED")
            except Exception as ex:
                self.stderr.write(f"Error for {file_dict['filename']}: {str(ex)}")
        self.stdout.write(f"Updating or creating finished")

    def _clean(self, files):
        filenames = [file.filename() for file in files]
        to_delete = Results.objects.exclude(filename__in=filenames)
        self.stdout.write(f"Deleting {len(to_delete)} objects...\nFILENAMES: "
                          f"{[file.filename for file in to_delete]}")
        try:
            to_delete.delete()
        except Exception as ex:
            self.stderr.write(f"Error deleting: {str(ex)}")
        self.stdout.write(f"Deleting finished")
