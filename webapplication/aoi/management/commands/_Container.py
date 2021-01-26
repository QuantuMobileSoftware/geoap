import docker
import logging
import time
import random

from typing import Optional
from urllib.parse import urlparse, parse_qs
from docker.types import DeviceRequest
from sip.settings import HOST_VOLUME, NOTEBOOK_EXECUTOR_GPUS

logger = logging.getLogger(__name__)


class Container:
    def __init__(self,
                 notebook,
                 host_port: Optional[str] = None,
                 host_volume: str = HOST_VOLUME,
                 container_port: str = "8888",
                 container_volume: str = "/home/jovyan/work",
                 shm_size: str = "1G",
                 environment: Optional[dict] = None,
                 gpus: Optional[str] = NOTEBOOK_EXECUTOR_GPUS, ):

        self.client = docker.from_env()
        self.image = self.client.images.get(notebook.image)

        self.notebook = notebook
        self.host_port = host_port
        self.host_volume = host_volume
        self.container_port = container_port
        self.container_volume = container_volume
        self.shm_size = shm_size

        self.environment = {"JUPYTER_ENABLE_LAB": "yes",
                            "NVIDIA_DRIVER_CAPABILITIES": "all"} if not environment else environment

        self.device_requests = [DeviceRequest(count=-1,
                                              capabilities=[['gpu']]), ] if gpus == "all" else None

        self.container = None
        self.url = None
        self.token = None

    def __run(self):
        self.container = self.client.containers.run(
            image=self.image,
            ports={f"{self.container_port}/TCP": self.host_port},
            shm_size=self.shm_size,
            volumes={self.host_volume: {"bind": self.container_volume, "mode": "rw"}},
            environment=self.environment,
            device_requests=self.device_requests,
            detach=True,
            auto_remove=True,
            stderr=True, )

    def __enter__(self):
        self.__run()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
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


class ContainerValidator(Container):
    def __init__(self, notebook):
        super().__init__(notebook)

    def validate(self):
        # TODO: add validation logic
        logger.info(f"Start validation for {self.notebook.name}")
        time.sleep(2)
        token = self.get_token(2)
        logger.info(f"Validation: {self.notebook.name} token: {token}")
        logger.info(f"Finished validation for {self.notebook.name}")

        validated = True

        return validated


class ContainerExecutor(Container):
    def __init__(self, notebook):
        super().__init__(notebook)

    def execute(self):
        # TODO: add execution logic
        logger.info(f"Start execution for {self.notebook.name}")
        sleep = random.randint(9, 20)
        logger.info(f"Sleeping: {sleep} sec")
        time.sleep(sleep)
        token = self.get_token(1)
        logger.info(f"Execution: {self.notebook.name} token: {token}")

        logger.info(f"Finished execution for {self.notebook.name}")
