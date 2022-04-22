from pathlib import Path
from planet_processing import PlanetVisualizer as Pv


REQUEST_ID = 0
ORDER_ID = ''
archive_path = ''

NAME = "Planet Downloader"

DATA_DIR = Path('')


API_KEY_DIR = DATA_DIR / ".secret/planet_api_key.json"
LOAD_DIR = DATA_DIR / "satellite_imagery"
RESULTS_DIR = DATA_DIR / "results/planet_downloader"
PBD_DIR = DATA_DIR / "notebooks/planet_downloader"
TEMP_DATA_DIR = DATA_DIR / 'temp'

TEMP_DIR = TEMP_DATA_DIR / ORDER_ID
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)


visualizer = Pv(archive_path, TEMP_DIR)
visualizer.run()
print('ok')



