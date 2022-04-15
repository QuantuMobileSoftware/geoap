
from pathlib import Path
from planet_processing import PlanetVisualizer as Pv

archive_path = '/home/dyman/Projects/quantum/planet_downloader/data/satellite_imagery/fc8c2b48-7bef-45d0-87a4-53a99f102952/Black-sea-2022-03-26-PS_psscene_analytic_8b_sr_udm2.zip'

REQUEST_ID = 0
ORDER_ID = 'fc8c2b48-7bef-45d0-87a4-53a99f102952'

NAME = "Planet Downloader"
# DATA_DIR = Path('/home/dyman/Projects/quantum/sip/data')
DATA_DIR = Path('/home/dyman/Projects/quantum/planet_downloader/data')


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



