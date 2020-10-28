import os

from django.core.management.base import BaseCommand
from ._File import File

class Command(BaseCommand):
    help = 'Publisher polls results folder every minute and updates results table'

    def handle(self, *args, **options):
        if options['short']:
            print("SHORT")
        else:
            print("HELLO PYTHON")
            self._scan()


    def add_arguments(self, parser):
        parser.add_argument(
            '-s',
            '--short',
            action='store_true',
            default=False,
            help='Вывод короткого сообщения'
        )
    def _scan(self):
        # path = settings.BASE_DIR
        results_folder = "/home/quantum/WorkQuantum/Task07_SIP/Git/sip/data/results"

        for dirpath, _, filenames in os.walk(results_folder):
            files = [os.path.abspath(os.path.join(dirpath, file))
                     for file in filenames if file.endswith('.geojson')]

        print(files)
        f = File(files[0])
        f.to_record()



