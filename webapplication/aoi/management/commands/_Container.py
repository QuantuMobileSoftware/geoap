import docker
import logging
import os
import json

from typing import Optional
from dateutil import parser as timestamp_parser
from docker.types import DeviceRequest
from aoi.management.commands._host_volume_paths import HostVolumePaths
from django.conf import settings

logger = logging.getLogger(__name__)


class Container:
    def __init__(self,
                 notebook,
                 container_name: Optional[str] = None,
                 labels: Optional[str] = None,
                 container_data_volume: str = "/home/jovyan/work",
                 container_executor_volume: str = "/home/jovyan/code",
                 shm_size: str = "1G",
                 environment: Optional[dict] = None,
                 gpus: Optional[str] = settings.NOTEBOOK_EXECUTOR_GPUS, ):

        self.notebook = notebook
        self.container_name = container_name
        self.labels = labels
        self.container_data_volume = container_data_volume
        self.container_executor_volume = container_executor_volume
        self.shm_size = shm_size

        self.environment = {"JUPYTER_ENABLE_LAB": "yes",
                            "NVIDIA_DRIVER_CAPABILITIES": "all"} if not environment else environment

        if gpus:
            capabilities = [['gpu']]
            if gpus == "all":
                self.device_requests = [DeviceRequest(count=-1,
                                                      capabilities=capabilities), ]
            else:
                self.device_requests = [DeviceRequest(device_ids=[str(gpus), ],
                                                      capabilities=capabilities), ]
        else:
            self.device_requests = None

    def run(self, command=None):
        client = docker.from_env()
        image = client.images.get(self.notebook.image)
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
                detach=True, )

    def get_volumes(self, client):
        base_container = client.containers.get(settings.BASE_CONTAINER_NAME)
        host_paths = HostVolumePaths(base_container.attrs)

        host_data_volume = host_paths.data_volume(settings.PERSISTENT_STORAGE_PATH)
        host_executor_volume = host_paths.executor_volume(settings.CODE_PATH)

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
        self.container_name = f"validator_{self.notebook.pk}"
        self.labels = dict(webapplication="validator", pk=str(self.notebook.pk))

    def validate(self):
        # TODO: add validation logic
        self.run("python --version")


class ContainerExecutor(Container):
    def __init__(self, request):
        super().__init__(request.notebook)
        self.request = request
        self.container_name = f"executor_{self.request.pk}"
        self.labels = dict(webapplication="executor", pk=str(self.request.pk))
        self.notebook_path = self.notebook.path

    def execute(self):
        logger.info(f"Request: {self.request.pk}: Start executing {self.notebook.name} notebook")

        kernel = f"--kernel {self.notebook.kernel_name}" if self.notebook.kernel_name else ""
        notebook_executor_path = os.path.join(self.container_executor_volume, "NotebookExecutor.py")

        command = f"""python {notebook_executor_path}
                      --input_path {self.notebook_path}
                      --request_id {self.request.pk}
                      --aoi '{self.request.polygon.wkt}'
                      --start_date {self.request.date_from}
                      --end_date {self.request.date_to}
                      --cell_timeout {settings.CELL_EXECUTION_TIMEOUT}
                      --notebook_timeout {settings.NOTEBOOK_EXECUTION_TIMEOUT}
                      {kernel}
                      """
        if self.notebook.additional_parameter:
            ESCAPE_DCT = {
                # escape all forward slashes
                '\\': '\\\\',
                "\'": "\\'",
                '\"': '\\"',
                '\b': '\\b',
                '\f': '\\f',
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t',
            }
            param_name = self.notebook.additional_parameter
            param_val = self.request.additional_parameter
            param_name = param_name.translate(param_name.maketrans(ESCAPE_DCT))
            param_val = param_val.translate(param_val.maketrans(ESCAPE_DCT))
            command += f"--parameter_name {param_name}\n"
            command += f"--parameter_val {param_val}\n"
            print('dyman', command)
        self.run(command)
