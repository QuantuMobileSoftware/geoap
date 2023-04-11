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

        log = logging.getLogger('urllib3')
        log.setLevel(logging.DEBUG)
        log.addHandler(logging.StreamHandler())

        retry_strategy = Retry(total=RETRY_INTERVAL,
                               backoff_factor=60, status_forcelist=[502, 503, 504])
        timeout = urllib3.Timeout(
            total=RETRY_LIMIT_SECONDS, connect=10.0, read=10.0)
        http = urllib3.PoolManager(timeout=timeout, retries=retry_strategy)

        with open(geoap_creds, 'r') as f:
            geoap_creds_data = json.load(f)

        self.api_endpoint = geoap_creds_data["API_ENDPOINT"]
        self.http = http
        self.log = log
        self.params = {"apikey": geoap_creds_data["API_KEY"]}

    def get_component_id(self, name):
        url = self.api_endpoint + "api/notebook"
        response = self.http.request('GET', url, fields=self.params)
        if response.status != 200:
            raise Exception(
                f"Get Component ID error  - status code {response.status_code}")

        components_list = json.loads(response.data.decode())
        for component in components_list:
            if component.get("name", "") == name:
                component_id = component.get("id")
                self.log.info(f"component_id: {component_id}")
                return component_id
        return None

    def get_user_id(self):
        url = self.api_endpoint + "api/users/current"
        response = self.http.request('GET', url, fields=self.params)
        if response.status != 200:
            raise Exception(
                f"Get User ID error  - status code {response.status_code}")
        user_id = json.loads(response.data.decode()).get("pk")
        self.log.info(f"user_id: {user_id}")
        return user_id

    def create_request(self, data):
        url = self.api_endpoint + "api/request"
        response = self.http.request(
            'POST', url + f"?apikey={self.params['apikey']}", fields=data)
        if response.status not in (200, 201):  # TODO Left only 201
            raise Exception(
                f"Create Request error - status code {response.status_code}")
        request = json.loads(response.data.decode())
        self.log.info(f"request: {request}")
        return request

    def wait_for_request_success_finish(self, request_id):
        url = self.api_endpoint + f"api/request/{request_id}"
        start_time = time.time()
        self.log.info(
            f"wait_for_request_success started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")
        while time.time() < start_time + RETRY_LIMIT_SECONDS:
            response = self.http.request('GET', url, fields=self.params)
            curr_request = json.loads(response.data.decode())
            if not curr_request.get("calculated"):
                if curr_request.get("error") and curr_request.get("finished_at"):
                    return False, curr_request.get("error")
                self.log.info(
                    f"Not calculated: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))}")
            else:
                self.log.info("Notebook calculated")
                return True, ""
            time.sleep(60)
        return False, f"Not finished during {RETRY_LIMIT_SECONDS} seconds"

    def pull_results(self, created_request_id):
        url = self.api_endpoint + "api/results"
        start_time = time.time()
        paths = []
        self.log.info(
            f"pull_results started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")
        while time.time() < start_time + RETRY_LIMIT_SECONDS:
            response = self.http.request('GET', url, fields=self.params)
            curr_request = json.loads(response.data.decode())
            for result in curr_request:
                if result.get("request") == created_request_id:
                    paths.append(result.get("filepath"))
            if paths:
                return paths
            else:
                self.log.info(
                    f"No results yet!: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))}")
                # TODO: need to be checked, we don't know how many responce files we have
                time.sleep(300)

    def download_stream_and_save_results(self, result_path, dir_path):
        url = self.api_endpoint + f"results/{result_path}"
        self.log.info(f"Started downloading")

        data_path = os.path.join(dir_path, os.path.basename(result_path))
        self.log.info(f"Data path:{data_path}")
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            self.log.info(f"Created dir:{data_path}")

        headers = {'Accept-Encoding': 'gzip'}
        req = self.http.request(
            'GET', url, fields=self.params, headers=headers, preload_content=False)

        self.log.info("Started writing result")
        with open(data_path, 'wb') as f:
            for chunk in req.stream(1024):
                f.write(chunk)
        req.release_conn()
        self.log.info("Finished writing result, closed connection")
