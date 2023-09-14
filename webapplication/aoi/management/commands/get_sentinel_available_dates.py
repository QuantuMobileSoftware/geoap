import sys
import time
from multiprocessing import Process

import datetime, os, json, logging
from aoi.models import AoI
import shapely
from django.db.models import Q
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.management.base import BaseCommand
from sentinelhub import CRS, Geometry, DataCollection, SHConfig, SentinelHubCatalog
from aoi.management.commands._notebook import StoppableThread

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class GetAvailableImageDateThread(StoppableThread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_stuff(self):
        logger.info("Starting to update sentinel images dates")
        one_week_ago = timezone.now() - timedelta(days=7)
        filtered_aoi = AoI.objects.filter(
            Q(sentinel_hub_available_dates_update_time__isnull=True) |
            Q(sentinel_hub_available_dates_update_time__lt=one_week_ago)
        )
        logger.info(f"Numbers of aoi need to be updated {len(filtered_aoi)}")
        for aoi in filtered_aoi:
            logger.info(f"Updating aoi with name - {aoi.name}, and id - {aoi.id}")
            aoi_polygon = aoi.polygon.wkt
            sentinel_dates = self.get_available_image_dates(aoi_polygon)
            aoi.sentinel_hub_available_dates = sentinel_dates
            aoi.sentinel_hub_available_dates_update_time = timezone.now()
            aoi.save(update_fields=['sentinel_hub_available_dates', 'sentinel_hub_available_dates_update_time'])
            logger.info(f"Aoi with name - {aoi.name}, and id - {aoi.id} updated successfully")
        logger.info("Finished to update sentinel images dates")

    @staticmethod
    def get_available_image_dates(polygon):
        sentinelhub_creds = None
        file_path = os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.SENTINELHUB_IMAGES_CREDS)
        try:
            with open(file_path, "r") as f:
                sentinelhub_creds = json.load(f)
        except FileNotFoundError:
            logger.warning(f"File {file_path} not found. Unable to read Sentinel Hub image credentials.")
            return None
        except json.JSONDecodeError as ex:
            logger.warning(f"Error decoding JSON in {file_path}: {ex}")
            return None
        except Exception as ex:
            logger.warning(f"An unexpected error occurred while reading {file_path}: {ex}")
            return None

        finish_date = datetime.datetime.now()
        start_date = finish_date - datetime.timedelta(days=settings.SENTINELHUB_IMAGES_PERIOD_IN_DAYS)
        time_interval = start_date.strftime("%Y-%m-%d"), finish_date.strftime("%Y-%m-%d")
        cloud = settings.CLOUD_PERCENT_VALUE
        collections = [{
            "name": DataCollection.SENTINEL2_L1C,
            "filter": f"eo:cloud_cover < {cloud}"
        }, {
            "name": DataCollection.SENTINEL1_IW,
            "filter": None
        }]
        config = SHConfig()
        config.sh_client_id = sentinelhub_creds.get("client_id", "")
        config.sh_client_secret = sentinelhub_creds.get("client_secret", "")
        geometry = Geometry(polygon, CRS.WGS84)

        if config.sh_client_id == "" or config.sh_client_secret == "":
            logger.warning(f"No client_id or client_secret")
            return None

        catalog = SentinelHubCatalog(config=config)
        fields = {"include": ["id", "properties.datetime", "properties.eo:cloud_cover", "geometry"], "exclude": []}
        result = {}

        for collection in collections:
            search_iterator = catalog.search(
                collection=collection["name"],
                geometry=geometry,
                time=time_interval,
                filter=collection["filter"],
                fields=fields,
            )
            full_coverage = []
            partly_coverage = []
            base_polygone = shapely.wkt.loads(polygon)
            for image in search_iterator:
                if image["geometry"]["crs"]["properties"]["name"] == 'urn:ogc:def:crs:OGC::CRS84':
                    sentinelhub_polygone = shapely.geometry.Polygon(image["geometry"]["coordinates"][0][0])
                    if base_polygone.within(sentinelhub_polygone):
                        full_coverage.append(image['properties']['datetime'][0:10])
                    else:
                        partly_coverage.append(image['properties']['datetime'][0:10])
                else:
                    logger.warning("Image has another coordinates, not 'urn:ogc:def:crs:OGC::CRS84'")

            if full_coverage or partly_coverage:
                result[collection["name"].collection_type] = {
                    "full_coverage": list(set(full_coverage)),
                    "partly_coverage": list(set(partly_coverage)),
                }

        return result


class Command(BaseCommand):
    help = "Update sentinel images dates"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode

    def run(self):
        threads = [
            GetAvailableImageDateThread(daemon=True),
        ]

        logger.info(f"Created Get Available ImageDate Thread")

        # starting threads
        started_at = time.time()

        for thread in threads:
            thread.start()

        # main thread looks at the status of all threads
        try:
            while True:
                for thread in threads:
                    if thread.exception or not thread.is_alive():
                        # an error in a thread - raise it in main thread too
                        logger.error(f"Thread: {thread} exited: {thread.exception}. Terminate all threads and restart")
                        raise thread.exception
                working_time = time.time() - started_at
                if working_time >= settings.NOTEBOOK_EXECUTOR_THREADS_RESTART_TIMEOUT:
                    raise RuntimeError(
                        f"Timeout {settings.NOTEBOOK_EXECUTOR_THREADS_RESTART_TIMEOUT} for threads was achieved")
                time.sleep(THREAD_SLEEP)
        except Exception as ex:
            logger.error(f"Main thread got exception: {str(ex)}. Stopping all threads...")

            for thread in threads:
                thread.stop()

            while threads:
                logger.info(f"Left threads: {threads}")
                for thread in threads:
                    if not thread.is_alive():
                        logger.info(f"For thread {thread} task is finished. Removing it")
                        threads.remove(thread)
                time.sleep(THREAD_SLEEP)

        logger.info(f"All threads are stopped. Restart get_sentinel_available_dates command")
        sys.exit(2)
