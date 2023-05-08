import urllib3
import json
import logging
import time
import os
from urllib3.util.retry import Retry

RETRY_INTERVAL = 2880  # num of intervals -> every minute
RETRY_LIMIT_SECONDS = 172800.0  # 2 days in seconds
REQUEST_TIMEOUT = 10


class GeoappClient:
    def __init__(self, geoap_creds):
        log = logging.getLogger("urllib3")
        log.setLevel(logging.DEBUG)
        log.addHandler(logging.StreamHandler())

        retry_strategy = Retry(
            total=RETRY_INTERVAL, backoff_factor=60, status_forcelist=[502, 503, 504]
        )
        timeout = urllib3.Timeout(total=RETRY_LIMIT_SECONDS, connect=10.0, read=10.0)

        with open(geoap_creds, "r") as f:
            geoap_creds_data = json.load(f)

        headers = {
            "Authorization": f"Token {geoap_creds_data['API_KEY']}",
            "Accept-Encoding": "gzip",
        }
        http = urllib3.PoolManager(
            timeout=timeout, retries=retry_strategy, headers=headers
        )

        self.api_endpoint = geoap_creds_data["API_ENDPOINT"]
        self.http = http
        self.log = log

    def get_component_id(self, name):
        url = self.api_endpoint + "api/notebook"
        response = self.http.request("GET", url)
        if response.status != 200:
            raise Exception(f"Get Component ID error  - status code {response.status}")

        components_list = json.loads(response.data.decode())
        for component in components_list:
            if component.get("name", "") == name:
                component_id = component.get("id")
                self.log.info(f"component_id: {component_id}")
                return component_id
        return None

    def get_user_id(self):
        url = self.api_endpoint + "api/users/current"
        response = self.http.request("GET", url)
        if response.status != 200:
            raise Exception(f"Get User ID error  - status code {response.status}")
        user_id = json.loads(response.data.decode()).get("pk")
        self.log.info(f"user_id: {user_id}")
        return user_id

    def create_request(self, data):
        url = self.api_endpoint + "api/request"
        response = self.http.request("POST", url, fields=data)
        if response.status not in (200, 201):  # TODO Left only 201
            raise Exception(f"Create Request error - status code {response.status}")
        request = json.loads(response.data.decode())
        self.log.info(f"request: {request}")
        return request

    def wait_for_request_success_finish(self, request_id):
        url = self.api_endpoint + f"api/request/{request_id}"
        start_time = time.time()
        self.log.info(
            f"wait_for_request_success started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}"
        )
        while time.time() < start_time + RETRY_LIMIT_SECONDS:
            response = self.http.request("GET", url)
            curr_request = json.loads(response.data.decode())
            if curr_request.get("finished_at"):
                if curr_request.get("calculated"):
                    return True, ""
                else:
                    return False, curr_request.get("error")
            else:
                self.log.info(
                    f"Not calculated: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))}"
                )
                time.sleep(60)
        return False, f"Not finished during {RETRY_LIMIT_SECONDS} seconds"

    def pull_results(self, created_request_id):
        url = self.api_endpoint + "api/results"
        paths = []
        response = self.http.request(
            "GET", url, fields={"request_id": created_request_id}
        )
        curr_request = json.loads(response.data.decode())
        for result in curr_request:
            paths.append(result.get("filepath"))
        num_of_files = len(paths)
        if paths:
            self.log.info(f"Pull results collected num of files: {num_of_files}")
            return num_of_files, paths
        else:
            raise Exception("no result files generated after script run")

    def download_stream_and_save_results(self, result_path, dir_path):
        url = self.api_endpoint + f"results/{result_path}"
        self.log.info(f"Started downloading")

        data_path = os.path.join(dir_path, os.path.basename(result_path))
        self.log.info(f"Data path:{data_path}")
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            self.log.info(f"Created dir:{data_path}")

        req = self.http.request("GET", url, preload_content=False)

        self.log.info("Started writing result")
        with open(data_path, "wb") as f:
            for chunk in req.stream(1024):
                f.write(chunk)
        req.release_conn()
        self.log.info("Finished writing result, closed connection")

    def check_files_amount(self, result_folder_path, files_amount):
        self.log.info(f"Should be {files_amount} files in result folder")
        count = 0
        for _, _, files in os.walk(result_folder_path):
            count += len(files)
        self.log.info(f"Calculeted {count} files in result folder")
        if count != files_amount:
            raise Exception(f"Download error, downloaded not all files")
