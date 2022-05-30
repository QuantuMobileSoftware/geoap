from datetime import datetime
import json
from pathlib import Path
import requests
import geojson
from requests.auth import HTTPBasicAuth
import shutil
import sys
import time


class PlanetAuth:
    def __init__(self, auth_key_path):
        """
        @param auth_key_path: absolute path to json file with api_key value
        """
        self.auth = self.get_auth(auth_key_path)
    
    @staticmethod
    def get_auth(auth_key_path):
        with open(auth_key_path, 'r') as f:
            return HTTPBasicAuth(json.load(f)['api_key'], '')


class PlanetOrderDownloader():
    orders_url = 'https://api.planet.com/compute/ops/orders/v2'
    
    def __init__(self, auth_key, download_path, polygon_aoi):
        """
        @param auth_key: str or Path:  api_key value
        @param download_path: str or Path: absolute path for zip archive downloading
        @param polygon_aoi: Polygon: aoi polygon of requested tile
        """
        self.auth = HTTPBasicAuth(auth_key, '')
        self.download_path = Path(download_path)
        self.order_state = None
        self.order_id = None
        self.order_url = None
        self.order_name = None
        self.order_archive_url = None
        self.order_archive_name = None
        self.manifest_url = None
        self.order_archive_size = None
        self.order_archive_digests = None
        self.aoi = polygon_aoi
    def set_order_id(self, order_id):
        self.order_id = order_id
        self.order_url = self.get_order_url()
    
    def get_order_url(self):
        return f'{self.orders_url}/{self.order_id}'
    
    def dump_no_valid_geosjon(self, polygon, geojson_path):
        label = 'Invalid orderid'
        name = f'{self.order_id}\nInvalid'
        style = dict(color='red')
        feature = geojson.Feature(geometry=polygon, properties=dict(label=label, style=style))
        response_folder = geojson_path / self.order_id
        response_folder.mkdir(parents=True, exist_ok=True)
        with open(response_folder / 'response.geojson', 'w') as f:
            geojson.dump(feature, f)

    def poll_for_success(self, timeout=10):
        """
        Waiting for 'success' or 'partial' response state for order
        @param timeout: int: timeout between requests
        @return:
        """
        while True:
            r = requests.get(self.order_url, auth = self.auth)
            response = r.json()
            if r.status_code == 404:
                print(f'Given ORDERID - {self.order_id} is not valid.')
                self.dump_no_valid_geosjon(self.aoi, self.download_path )
                sys.exit(1)
            if 'code' in response.keys():
                if response['code'] == 601:
                    print(response['message'])
                    sys.exit(1)
            state = response['state']
            if state == 'success' or state == 'partial':
                self.order_state = state
                print(f'Order {self.order_id} is {self.order_state}.')
                break
            if state == 'failed':
                print(f'Order {self.order_id} is {self.order_state}.')
                sys.exit(1)
            time.sleep(timeout)
            
    def check_expires_date(self, expires_date):
        """
        Compare datetime.now() with expires_date.
        If expires_date < datetime.now() exit the script.
        :param expires_date: str: datatime with milliseconds, example - '2022-04-13T07:40:06.907Z'
        :return:
        """
        expires_date = time.strptime(expires_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        if expires_date < time.strptime(str(datetime.now()), '%Y-%m-%d %H:%M:%S.%f'):
            print(
                f"""
                order {self.order_name} with id {self.order_id} is expired!
                You can submit a request for inquiries about orders placed more than three months ago!
                https://support.planet.com/hc/en-us/requests/new/
                """
            )
            sys.exit(1)
            
    def download_order_info(self, n_requests=10):
        """
        Get order info and save it as 'results.json' file.
        If requests during n_requests were unsuccessful exit the script.
        @param n_requests: int: number of requests we will try to get order results.
        @return: json: order info
        """
        for i in range(0, n_requests):
            print(f'GET  {self.order_url}')
            response = requests.get(self.order_url, auth=self.auth)
            print(f'GET {self.order_url} returned {response.status_code} status code!')
            if response.status_code == 200:
                data = response.json()
                with open(self.download_path / 'results.json', 'w') as f:
                    f.write(json.dumps(data))
                return data
            time.sleep(10)
        print(f'GET {self.order_url} was unsuccessful!')
        sys.exit(1)
        
    def download_archive_info(self, n_requests=10):
        """
        Get archive info and save it as 'manifest.json' file.
        If requests during n_requests were unsuccessful exit the script.
        @param n_requests: int: number of requests we will try to get archive info.
        @return: json
        """
        for i in range(0, n_requests):
            print(f'GET  {self.manifest_url}')
            response = requests.get(self.manifest_url, auth=self.auth)
            print(f'GET {self.manifest_url} returned {response.status_code} status code!')
            if response.status_code == 200:
                data = response.json()
                with open(self.download_path / 'manifest.json', 'w') as f:
                    f.write(json.dumps(data))
                return data
            time.sleep(10)
        print(f'GET {self.manifest_url} was unsuccessful!')
        sys.exit(1)

    def get_order_info(self):
        """
        Get and extract order name and order archive name.
        @return: order_name: str, order_archive_name: str
        """
        self.download_path = self.download_path / self.order_id
        self.download_path.mkdir(parents=True, exist_ok=True)
        if (self.download_path / 'results.json').exists():
            with open(self.download_path / 'results.json', 'r') as f:
                data = json.load(f)
        else:
            data = self.download_order_info()
        self.order_name = data['name']
        results = data['_links']['results']
        for result in results:
            # self.check_expires_date(result['expires_at'])
            if Path(result['name']).suffix == '.json':
                self.manifest_url = result['location']
                if (self.download_path / 'manifest.json').exists():
                    with open(self.download_path / 'manifest.json', 'r') as f:
                        archive_info = json.load(f)
                else:
                    archive_info = self.download_archive_info()
                self.order_archive_size = archive_info['files'][0]['size']
                self.order_archive_digests = archive_info['files'][0]['digests']
            if Path(result['name']).suffix == '.zip':
                self.order_archive_url = result['location']
                self.order_archive_name = Path(result['name']).name
        return self.order_name, self.order_archive_name
        
    def download_order_archive(self, n_requests=10):
        """
        Download order archive.
        @param n_requests: int: number of requests we will try to get archive info.
        @return: None
        """
        archive_path = self.download_path / self.order_archive_name
        if not archive_path.exists():
            with open(archive_path, 'w') as f:
                f.write('')
        print('downloaded size:', archive_path.stat().st_size)
        print('order_archive_size:', self.order_archive_size)
        print(f'downloading {self.order_archive_name} to {archive_path}')
        chunk_length = 16*1024*1024
        
        while n_requests > 0:
            if self.order_archive_size - archive_path.stat().st_size == 0:
                break
            headers = {"Range": f"bytes={archive_path.stat().st_size}-"}
            response = requests.get(self.order_archive_url, stream=True, headers=headers)
            if response.status_code == 206:
                with open(archive_path, 'ab') as f:
                    shutil.copyfileobj(response.raw, f, length=chunk_length)
            else:
                print(f'GET {self.order_archive_url} returned {response.status_code} status code!')
            n_requests = n_requests - 1
        
        if archive_path.stat().st_size < self.order_archive_size:
            print(f'GET {self.order_archive_url} during {n_requests} was unsuccessful! Aborting!')
            sys.exit(1)
            
        print(f'File {archive_path} was downloaded')
