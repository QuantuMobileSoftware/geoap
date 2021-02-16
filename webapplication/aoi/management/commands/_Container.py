import docker
import logging
import os
import json

from typing import Optional
from docker.types import DeviceRequest
from aoi.management.commands._host_volume_paths import HostVolumePaths
from django.conf import settings

logger = logging.getLogger(__name__)

class Container:
    def __init__(self,
                 notebook,
                 container_data_volume: str = "/home/jovyan/work",
                 container_executor_volume: str = "/home/jovyan/code",
                 shm_size: str = "1G",
                 environment: Optional[dict] = None,
                 gpus: Optional[str] = settings.NOTEBOOK_EXECUTOR_GPUS, ):

        self.notebook = notebook
        self.container_data_volume = container_data_volume
        self.container_executor_volume = container_executor_volume
        self.shm_size = shm_size

        self.environment = {"JUPYTER_ENABLE_LAB": "yes",
                            "NVIDIA_DRIVER_CAPABILITIES": "all"} if not environment else environment

        self.device_requests = [DeviceRequest(count=-1,
                                              capabilities=[['gpu']]), ] if gpus == "all" else None
        self.container = None

    def __run(self):
        client = docker.from_env()
        image = client.images.get(self.notebook.image)
        volumes = self.get_volumes(client)

        self.container = client.containers.run(
            image=image,
            shm_size=self.shm_size,
            volumes=volumes,
            environment=self.environment,
            device_requests=self.device_requests,
            detach=True,
            auto_remove=True, )

    def get_volumes(self, client):
        base_container = client.containers.get(settings.BASE_CONTAINER_NAME)
        host_paths = HostVolumePaths(base_container.attrs)

        host_data_volume = host_paths.data_volume(settings.HOST_VOLUME_DATA_BASENAME)
        host_executor_volume = host_paths.executor_volume(settings.HOST_VOLUME_WEBAPPLICATION_BASENAME)

        volumes = {host_data_volume: {"bind": self.container_data_volume, "mode": "rw"},
                   host_executor_volume: {"bind": self.container_executor_volume, "mode": "rw"}, }

        if not self.notebook.options:
            return volumes

        additional_volumes = self.notebook.options.get("volumes")
        if additional_volumes:
            additional_volumes = json.loads(additional_volumes)
            for host_volume, container_volume in additional_volumes.items():
                if host_volume not in volumes:
                    volumes[host_volume] = {"bind": container_volume, "mode": "rw"}
                else:
                    logger.warning(f"Notebook: {self.notebook.name}: ignoring volume {host_volume}:{container_volume} "
                                     f"mounting. It exists.")
        return volumes


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
        logger.info(f"Request: {self.request.pk}: Start executing {self.notebook.name} notebook")

        kernel = f"--kernel {self.notebook.kernel_name}" if self.notebook.kernel_name else ""
        notebook_executor_path = os.path.join(self.container_executor_volume, "NotebookExecutor.py")

        command = f"""python {notebook_executor_path}
                      --input_path {self.notebook_path}
                      --request_id {self.request.pk}
                      --aoi '{self.request.aoi.polygon.wkt}'
                      --start_date {self.request.date_from}
                      --end_date {self.request.date_to}
                      --cell_timeout {settings.CELL_EXECUTION_TIMEOUT}
                      --notebook_timeout {settings.NOTEBOOK_EXECUTION_TIMEOUT}
                      {kernel}
                      """

        exit_code, (_, stderr) = self.container.exec_run(command, demux=True)

        logger.info(f"Request: {self.request.pk}: Finished executing notebook {self.notebook.name}, "
                    f"exit code: {exit_code}")

        if exit_code == 0:
            return True
        else:
            logger.error(f"Request {self.request.pk}: {self.notebook.name}: {stderr.decode('utf-8')}")
            return False
