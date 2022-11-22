import docker
import logging
import os
import json

from typing import Optional
from dateutil import parser as timestamp_parser
from docker.types import DeviceRequest
from aoi.management.commands._host_volume_paths import HostVolumePaths
from django.conf import settings

from aoi.models import Request, Component

logger = logging.getLogger(__name__)


class Container:
    def __init__(self,
                 component: Component,
                 container_name: Optional[str] = None,
                 labels: Optional[str] = None,
                 container_data_volume: str = "/home/jovyan/work",
                 container_executor_volume: str = "/home/jovyan/code",
                 shm_size: str = "1G",
                 environment: Optional[dict] = None,):

        self.component = component
        self.container_name = container_name
        self.labels = labels
        self.container_data_volume = container_data_volume
        self.container_executor_volume = container_executor_volume
        self.shm_size = shm_size
        self.environment=environment

        standard_environment = {"JUPYTER_ENABLE_LAB": "yes",
                                "NVIDIA_DRIVER_CAPABILITIES": "all"}
        if not environment:
            self.environment = standard_environment
        else:
            self.environment=environment
            self.environment.update(standard_environment)

        if component.run_on_gpu and settings.NOTEBOOK_EXECUTOR_GPUS:
            logger.info(f"will use GPU '{settings.NOTEBOOK_EXECUTOR_GPUS}' for {component.name} notebook")
            capabilities = [['gpu']]
            if settings.NOTEBOOK_EXECUTOR_GPUS == "all":
                self.device_requests = [DeviceRequest(count=-1,
                                                      capabilities=capabilities), ]
            else:
                self.device_requests = [DeviceRequest(device_ids=[str(settings.NOTEBOOK_EXECUTOR_GPUS), ],
                                                      capabilities=capabilities), ]
        else:
            logger.info(f"will use CPU only for {component.name} notebook")
            self.device_requests = None

    def run(self, command=None):
        client = docker.from_env()
        image = client.images.get(self.component.image)
        volumes = self.get_volumes(client)

        client.containers.run(
                command=command,
                image=image,
                shm_size=self.shm_size,
                volumes=volumes,
                environment=self.environment,
                device_requests=self.device_requests,
                name=self.container_name,
                labels=self.labels,
                detach=True,
                user="root" )

    def get_volumes(self, client):
        base_container = client.containers.get(os.uname()[1])
        host_paths = HostVolumePaths(base_container.attrs)

        host_data_volume = host_paths.data_volume(settings.PERSISTENT_STORAGE_PATH)
        host_executor_volume = host_paths.executor_volume(settings.CODE_PATH)

        volumes = {host_data_volume: {"bind": self.container_data_volume, "mode": "rw"},
                   host_executor_volume: {"bind": self.container_executor_volume, "mode": "rw"}, }
        
        return volumes
    
    @staticmethod
    def container_attrs(container):
        attrs = container.attrs
        return dict(
            finished_at=timestamp_parser.parse(attrs["State"]["FinishedAt"]),
            exit_code=attrs["State"]["ExitCode"],
            logs=container.logs().decode('utf-8') if container.logs() else None,
            pk=int(container.labels['pk']), )

    @staticmethod
    def filter(docker_client, status, label):
        containers = docker_client.containers.list(filters=dict(status=status,
                                                                label=label))
        return containers


class ContainerValidator(Container):
    def __init__(self, notebook):
        super().__init__(notebook)
        self.container_name = f"validator_{self.component.pk}"
        self.labels = dict(webapplication="validator", pk=str(self.component.pk))

    def validate(self):
        # TODO: add validation logic
        self.run("python --version")


class ContainerExecutor(Container):
    def __init__(self, request:Request):
        super().__init__(request.component, environment=request.get_environment())
        self.request = request
        self.container_name = f"executor_{self.request.pk}"
        self.labels = dict(webapplication="executor", pk=str(self.request.pk))
        self.notebook_path = self.component.notebook_path

    def execute(self):
        logger.info(f"Request: {self.request.pk}: Start executing {self.component.name} notebook")
        self.request.create_result_folder()
        path_to_executor = os.path.join(self.container_executor_volume, "NotebookExecutor.py")
        self.run(self.component.get_command(path_to_executor))
