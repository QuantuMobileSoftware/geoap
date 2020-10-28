import os
from pathlib import Path
from django.contrib.sites.models import Site
from datetime import datetime

class File:
    def __init__(self, path):
        print(path)
        self.path = path

    def _get_filename(self):
        # stem = Path(self.path).stem
        #print("STEM")
        # print(stem)
        filename = os.path.basename(self.path)
        print("FILENAME")
        print(filename)

    def _get_modified_timestamp(self):
        timestamp = os.path.getmtime(self.path)
        print("MODIFIED")
        timestamp = datetime.fromtimestamp(timestamp)
        print(timestamp)
        print(timestamp.strftime('%Y-%m-%d %H:%M:%S'))

    def _get_abs_url(self, results_path='results'):
        current_site = Site.objects.get_current()
        print("DOMAIN")
        print(current_site.domain)

    def to_record(self):
        self._get_filename()
        self._get_modified_timestamp()
        self._get_abs_url()


