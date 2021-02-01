import copy
import docker
import logging
import time
import nbformat
import os

from typing import Optional
from urllib.parse import urlparse, parse_qs
from docker.types import DeviceRequest
from django.utils.timezone import localtime
from sip.settings import (HOST_VOLUME,
                          NOTEBOOK_EXECUTOR_GPUS,
                          CELL_EXECUTION_TIMEOUT,
                          NOTEBOOKS_FOLDER, )

from nbparameterise import extract_parameters, Parameter
from nbparameterise.code import first_code_cell



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
        client = docker.from_env()
        image = client.images.get(self.notebook.image)
        self.container = client.containers.run(
            image=image,
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
        # token = self.get_token()
        time.sleep(2)
        logger.info(f"Finished validation for {self.notebook.name}")

        validated = True

        return validated


class ContainerExecutor(Container):
    def __init__(self, request):
        super().__init__(request.notebook)
        self.request = request

    def execute(self):
        logger.info(f"Start execution request {self.request.pk}: {self.notebook.name}")

        notebook_editor = NotebookEditor(self.request)
        output = notebook_editor.edit()
        path = os.path.join(os.path.dirname(self.notebook.path),
                            os.path.basename(output))

        kernel = f"--ExecutePreprocessor.kernel_name={self.notebook.kernel_name}" \
            if self.notebook.kernel_name else ""

        command = f"""jupyter nbconvert 
                      --inplace
                      --to notebook
                      --allow-errors
                      --ExecutePreprocessor.timeout={CELL_EXECUTION_TIMEOUT} 
                      --execute {path} 
                      {kernel} 
                    """

        exit_code, output = self.container.exec_run(command)

        logger.info(f"Finished container execution request {self.request.pk}: "
                    f"{self.notebook.name} with exit code: {exit_code}")

        if exit_code == 0:
            return True
        else:
            logger.error(f"Request {self.request.pk}: {self.notebook.name}: {output.decode('utf-8')}")
            return False


class NotebookEditor:

    def __init__(self, request):

        self.request_pk = request.pk
        self.notebook_name = request.notebook.name

        self.PARAMS = dict(REQUEST_ID=request.pk,
                           AOI=request.aoi.polygon.ewkt,
                           START_DATE=str(request.date_from) if request.date_from else None,
                           END_DATE=str(request.date_to) if request.date_to else None, )

        self.path = self._get_path()
        self.original_notebook = self.read()

    def _get_path(self):
        name = self.notebook_name + ".ipynb"
        for root, _, files in os.walk(NOTEBOOKS_FOLDER):
            if name in files:
                return os.path.join(root, name)
        else:
            raise ValueError(f"Request {self.request_pk}: path for notebook {name} not exists in {NOTEBOOKS_FOLDER}!")

    def edit(self):
        origin_parameters = extract_parameters(self.original_notebook)

        parameters = [Parameter(param, type(param), value)
                      for param, value in self.PARAMS.items()]

        for origin in origin_parameters:
            if origin.name not in list(self.PARAMS):
                parameters.append(origin)

        edited_notebook = self._replace_parameters(self.original_notebook, parameters)
        path = self.write(edited_notebook)
        return path

    def _replace_parameters(self, notebook, parameters):
        notebook = copy.deepcopy(notebook)
        first_code_cell(notebook).source +=  "\n\n# added by backend notebook_executor.py script:" +\
                                             "\n" + self._build_replacing(parameters)
        return notebook

    @staticmethod
    def _build_replacing(parameters):
        return "\n".join(f"{param.name} = {param.value!r}" for param in parameters)

    def read(self):
        with open(self.path) as file:
            notebook = nbformat.read(file, as_version=4)
        return notebook


    def write(self, nb):
        timestamp = localtime().strftime("%Y%m%dT%H%M%S")
        path = os.path.join (os.path.dirname(self.path),
                               f"{self.notebook_name}_{self.request_pk}_{timestamp}.ipynb")

        with open(path, "w", encoding="utf-8") as file:
            nbformat.write(nb, file)
        os.chmod(path, 0o666)
        return path
