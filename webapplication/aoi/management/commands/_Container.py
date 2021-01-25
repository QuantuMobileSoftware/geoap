import docker
import requests
import logging
import time
import random

from typing import Optional
from urllib.parse import urlparse, parse_qs
from docker.types import DeviceRequest
from sip.settings import HOST_VOLUME

logger = logging.getLogger(__name__)


class Container:
    def __init__(self, notebook):
        self.notebook = notebook
        self.client = docker.from_env()
        self.container = None
        self.url = None
        self.token = None

    def get_image(self):
        image_name = self.notebook.image
        image = self.client.images.get(image_name)
        return image

    def run(self,
            host_port: Optional[str] = None,
            host_volume: str = HOST_VOLUME,
            container_port: str = "8888",
            shm_size: str = "1G",
            container_volume: str = "/home/jovyan/work",
            environment: Optional[dict] = None,
            gpus: Optional[str] = "all", ):

        environment = {"JUPYTER_ENABLE_LAB": "yes",
                       "NVIDIA_DRIVER_CAPABILITIES": "all"} if not environment else environment

        if gpus == "all":
            device_requests = [DeviceRequest(count=-1, capabilities=[['gpu']]), ]
        else:
            device_requests = None

        image = self.get_image()

        self.container = self.client.containers.run(
                            image=image,
                            auto_remove=True,
                            ports={f"{container_port}/TCP": host_port},
                            shm_size=shm_size,
                            stderr=True,
                            volumes={host_volume: {"bind": container_volume, "mode": "rw"}},
                            environment=environment,
                            device_requests=device_requests,
                            detach=True, )

    def validate(self):
        # TODO: add validation logic
        logger.info(f"Start validation for {self.notebook.name}")
        time.sleep(2)
        token = self.get_token(2)
        logger.info(f"Validation: {self.notebook.name} token: {token}")
        logger.info(f"Finished validation for {self.notebook.name}")

        self._stop()

        validated = True

        return validated

    def execute(self):
        # TODO: add execution logic
        logger.info(f"Start execution for {self.notebook.name}")
        sleep = random.randint(9, 20)
        logger.info(f"Sleeping: {sleep} sec")
        time.sleep(sleep)
        token = self.get_token(1)
        logger.info(f"Execution: {self.notebook.name} token: {token}")

        self._stop()
        logger.info(f"Finished execution for {self.notebook.name}")


    def _stop(self):
        self.container.stop()

    def get_token(self, sleep: int = 5):

        result = self.container.exec_run("jupyter notebook list")
        time.sleep(sleep)

        output = result.output.decode("utf-8")
        self.url = output.split("\n")[1].split(" ")[0]
        parsed_url = urlparse(self.url)
        query = parse_qs(parsed_url.query)
        token = query["token"][0]

        return token


# TODO: probably for next tasks
def __login(url, token):
    print("LOGGGIN")
    s = requests.Session()
    url='http://0.0.0.0:8889/login'
    print("GET SESSION")
    resp=requests.get(url)
    print("SESSION")
    xsrf_cookie = resp.cookies['_xsrf']
    print("XSRF")
    print(xsrf_cookie)

    params={'_xsrf':xsrf_cookie,'token': token}
    response = s.post(url, data=params)

    print(response.status_code)
    print(response.json())
