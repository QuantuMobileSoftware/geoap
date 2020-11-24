from pathlib import Path
from django.conf import settings
from publisher import ogr2ogr
file_name = 'all.geojson'
input_file = Path(settings.RESULTS_FOLDER) / file_name

ogr2ogr.main(["", "-f", "MVT", "-dsco", "FORMAT=MBTILES", "-dsco", "MAXZOOM=18",
              str(input_file.with_suffix(".mbtiles")), str(input_file)])
