import docker
import logging
import os

from typing import Optional
from docker.types import DeviceRequest
from sip.settings import (HOST_VOLUME,
                          NOTEBOOK_EXECUTOR_GPUS,
                          CELL_EXECUTION_TIMEOUT,
                          NOTEBOOK_EXECUTION_TIMEOUT,
                          HOST_NOTEBOOK_EXECUTOR_VOLUME, )

logger = logging.getLogger(__name__)

NOTEBOOK_BASE_PATH = "/home/jovyan/"
CONTAINER_VOLUME = os.path.join(NOTEBOOK_BASE_PATH, "work")
CONTAINER_NOTEBOOK_EXECUTOR_VOLUME = os.path.join(NOTEBOOK_BASE_PATH, "code")
NOTEBOOK_EXECUTOR_PATH = os.path.join(HOST_NOTEBOOK_EXECUTOR_VOLUME, "NotebookExecutor.py")

CONTAINER_PORT = "8888"
SHARED_MEMORY_SIZE = "1G"


class Container:
    def __init__(self,
                 notebook,
                 host_port: Optional[str] = None,
                 host_volume: str = HOST_VOLUME,
                 container_port: str = CONTAINER_PORT,
                 container_volume: str = CONTAINER_VOLUME,
                 shm_size: str = SHARED_MEMORY_SIZE,
                 environment: Optional[dict] = None,
                 gpus: Optional[str] = NOTEBOOK_EXECUTOR_GPUS, ):

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

    def __run(self):
        client = docker.from_env()
        image = client.images.get(self.notebook.image)
        self.container = client.containers.run(
            image=image,
            ports={f"{self.container_port}/TCP": self.host_port},
            shm_size=self.shm_size,
            volumes={self.host_volume: {"bind": self.container_volume, "mode": "rw"},
                     HOST_NOTEBOOK_EXECUTOR_VOLUME: {"bind": HOST_NOTEBOOK_EXECUTOR_VOLUME, "mode": "rw"}, },
            environment=self.environment,
            device_requests=self.device_requests,
            detach=True,
            auto_remove=True, )

    def __enter__(self):
        self.__run()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.container.stop()


class ContainerValidator(Container):
    def __init__(self, notebook):
        super().__init__(notebook)

    def validate(self):
        # TODO: add validation logic
        logger.info(f"Start validation for {self.notebook.name}")

        logger.info(f"Finished validation for {self.notebook.name}")

        validated = True

        return validated


class ContainerExecutor(Container):
    def __init__(self, request):
        super().__init__(request.notebook)
        self.request = request

        self.notebook_path = self.notebook.path

    def execute(self):
        logger.info(f"Request: {self.request.pk}: Start editing {self.notebook.name} notebook")

        kernel = f"--kernel {self.notebook.kernel_name}" if self.notebook.kernel_name else ""

        command = f"""python {NOTEBOOK_EXECUTOR_PATH}
                      --input_path {self.notebook_path}
                      --request_id {self.request.pk}
                      --aoi '{self.request.aoi.polygon.wkt}'
                      --start_date {self.request.date_from}
                      --end_date {self.request.date_to}
                      --cell_timeout {CELL_EXECUTION_TIMEOUT}
                      --notebook_timeout {NOTEBOOK_EXECUTION_TIMEOUT}
                      {kernel}
                      """

        exit_code, (_, stderr) = self.container.exec_run(command, demux=True)

        logger.info(f"Request: {self.request.pk}: Finished editing notebook {self.notebook.name}, "
                    f"exit code: {exit_code}")

        if exit_code == 0:
            return True
        else:
            logger.error(f"Request {self.request.pk}: {self.notebook.name}: {stderr.decode('utf-8')}")
            return False
