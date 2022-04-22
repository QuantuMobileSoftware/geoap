from pathlib import Path
from planet_processing import PlanetOrderDownloader as PoD

REQUEST_ID = 0
ORDER_ID = ''

NAME = "Planet Downloader"

DATA_DIR = Path('')


API_KEY_DIR = DATA_DIR / ".secret/planet_api_key.json"
LOAD_DIR = DATA_DIR / "satellite_imagery"
RESULTS_DIR = DATA_DIR / "results/planet_downloader"
PBD_DIR = DATA_DIR / "notebooks/planet_downloader"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

downloader = PoD(API_KEY_DIR, LOAD_DIR)
downloader.set_order_id(ORDER_ID)
downloader.poll_for_success()
order_name, order_archive_name = downloader.get_order_info()
downloader.download_order_archive()
