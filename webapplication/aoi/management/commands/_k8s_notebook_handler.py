import logging
import re
import os
import shutil
import hashlib
from typing import Dict, List

from kubernetes import client, config
from kubernetes.client.rest import ApiException

from aoi.models import Component, Request
from aoi.management.commands.executor import NotebookExecutor
from aoi.management.commands._ComponentExecutionHelper import ComponentExecutionHelper

from django.conf import settings
from django.utils.timezone import localtime

logger = logging.getLogger(__name__)

def clean_container_logs(logs):
    log_lines = logs.split('\n')
    log_lines = [re.sub(r'^\s*\d+\s*', '', line) for line in log_lines]

    log_text = ''.join(log_lines)
    log_text = re.sub(r'\x1b\[[0-9;]*m', '', log_text)
    log_text = re.sub(r'\s+', ' ', log_text)
    return log_text


class K8sNotebookHandler(ComponentExecutionHelper):

    def __init__(self, namespace: str) -> None:
        config.load_incluster_config()
        self.core_v1 = client.CoreV1Api()
        self.batch_v1 = client.BatchV1Api()
        self.delete_options = client.V1DeleteOptions()
        self.namespace = namespace
        self.component_validation_job_label = "component-validation"
        self.component_execution_job_label = "component-execution"
        self.notebook_execution_script = self.deliver_notebook_executor()

    @staticmethod
    def get_file_md5(filepath: str) -> str:
        """Create md5 hash of byte-read file

        Args:
            filepath (str): Path to file

        Returns:
            str: Result of md5 hash function
        """

        with open(filepath, 'rb') as file:
            hashed_file = hashlib.md5(file.read())
        return hashed_file.hexdigest()

    @staticmethod
    def deliver_notebook_executor() -> str:
        """ Check if NotebookExecutor.py changed with md5 hash and last modified date.
        Deliver NotebookExecutor.py script into volume that will be
        shared with notebook execution job pods.

        Returns:
            str: path to file with notebook execution script
        """
        current_hash = ''
        current_mod_data = 0

        notebook_execution_file = os.path.join(
            settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH,
            os.path.basename(NotebookExecutor.__file__)
            )

        if os.path.exists(notebook_execution_file):
            current_hash = K8sNotebookHandler.get_file_md5(
                notebook_execution_file)
            current_mod_data = os.path.getmtime(notebook_execution_file)

        challenger_hash = K8sNotebookHandler.get_file_md5(
            NotebookExecutor.__file__)
        challenger_mod_date = os.path.getmtime(NotebookExecutor.__file__)

        if not (challenger_hash == current_hash and challenger_mod_date == current_mod_data):
            shutil.copy2(NotebookExecutor.__file__,
                         settings.PERSISTENT_STORAGE_PATH)
            logger.info(
                'File with notebook execution script have changed. File replaced')

        logger.info(
            f'File with notebook execution script is up to date to "{notebook_execution_file}" ')
        return notebook_execution_file

    def start_job(self, job: client.V1Job):
        """Use API to start job in cluster

        Args:
            job (client.V1Job): Description of Job to start
        """
        try:
            api_response = self.batch_v1.create_namespaced_job(
                body=job,
                namespace=self.namespace,
                pretty=False
            )
            logger.info(
                f"Job created in namespace: '{self.namespace}'. status='{api_response.status}")
        except ApiException as e:
            logger.error(
                f'Exception when calling BatchV1Api->create_namespaced_job: {e}\n')

    @staticmethod
    def create_job_object(
        image: str,
        name: str,
        labels: Dict[str, str],
        command: List[str],
        backofflimit: int = 6,
        active_deadline_seconds: int = 36_000,
        require_gpu=False,
        environment: List[client.V1EnvVar] = None

    ) -> client.V1Job:
        """StaticMethod. Creates job description.

        Args:
            image (str): Docker image name and tag
            name (str): Name of the future job
            labels (Dict[str, str]): Labels for k8s objects
            command (List[str]): Command to run in POD on startup
            backofflimit (int, optional): The number of retries before considering 
                a Job as failed. Defaults to 6.
            active_deadline_seconds (int, optional): Active deadline, once a Job reaches it,
                all of its running Pods are terminated and the Job status will become type:
                Failed with reason: DeadlineExceeded. Defaults to 36_000s (10 hours).
            require_gpu (bool, optional): Whether or not job require GPU cores. Defaults to False

        Returns:
            client.V1Job
        """

        gpu_resources = client.V1ResourceRequirements(
            requests = {
                "cpu": "4000m",
                "memory": "16Gi",
                "nvidia.com/gpu": str(settings.GPU_CORES_PER_NOTEBOOK)
            },
            limits = {
                "cpu": "4000m",
                "memory": "16Gi",
                "nvidia.com/gpu": str(settings.GPU_CORES_PER_NOTEBOOK)
            }
        )
        component_volume = client.V1Volume(
            name='component-volume',
            persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                claim_name='geoap-data-pvc'
            )
        )
        component_volume_mount = client.V1VolumeMount(
            name='component-volume',
            mount_path=settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH,
            read_only=False
        )
        volumes = [component_volume]
        volume_mounts = [component_volume_mount]
        if require_gpu:
            shm_volume = client.V1Volume(
                name="dshm",
                empty_dir=client.V1EmptyDirVolumeSource(
                    medium="Memory",
                    size_limit="14Gi"
                )
            )
            shm_volume_mount = client.V1VolumeMount(
                name="dshm",
                mount_path="/dev/shm"
            )
            volumes.append(shm_volume)
            volume_mounts.append(shm_volume_mount)

        container = client.V1Container(
            name=name,
            image=image,
            command=command,
            env=environment,
            security_context=client.V1SecurityContext(
                run_as_user=0
            ),
            volume_mounts=volume_mounts,
            image_pull_policy='Always',
            # image_pull_policy='IfNotPresent',
            resources=gpu_resources if require_gpu else None
        )
        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(
                labels=labels,
                annotations={
                    "gke-gcsfuse/volumes": "true"
                }
            ),
            spec=client.V1PodSpec(
                containers=[container, ],
                volumes=volumes,
                restart_policy="Never",
                image_pull_secrets=[
                    {
                        'name': settings.IMAGE_PULL_SECRETS,
                    },
                ],
                node_selector={"cloud.google.com/gke-accelerator": "nvidia-tesla-t4"} if require_gpu else {},
                service_account_name='kuber.service.account',
            ),
        )
        spec = client.V1JobSpec(
            template=template,
            backoff_limit=backofflimit,
            active_deadline_seconds=active_deadline_seconds
        )
        job = client.V1Job(
            api_version="batch/v1",
            kind="Job",
            metadata=client.V1ObjectMeta(name=name),
            spec=spec
        )
        logger.info("Job description created. Name: '%s'" % str(name))
        return job

    def start_component_validation(self) -> None:
        """Method to retrieve not validated components, 
        create jobs to validate them and supervise results
        """

        label_selector = f'job_type={self.component_validation_job_label}'
        jobs = self.batch_v1.list_namespaced_job(
            namespace=self.namespace, label_selector=label_selector)
        component_ids_list = [int(x.metadata.labels['component_id'])
                             for x in jobs.items]
        not_validated_components = Component.objects.filter(
            run_validation=False).exclude(id__in=component_ids_list)
        logger.info(
            f'Number of components to validate: {len(not_validated_components)}\n')

        for component in not_validated_components:
            job_manifest = self.create_component_validation_job_manifest(
                component)
            self.start_job(job_manifest)

    def start_component_validation_jobs_supervision(self) -> None:
        """Retrieve notebook validation jobs and check them """
        label_selector = f'job_type={self.component_validation_job_label}'
        jobs = self.batch_v1.list_namespaced_job(
            namespace=self.namespace, label_selector=label_selector)
        for job in jobs.items:
            self.supervise_component_validation_job(job)

    def create_component_validation_job_manifest(self, component: Component) -> client.V1Job:
        """Method to create notebook validation job in k8s cluster

        Args:
            notebook (JupyterNotebook): Notebook instance to validate

        Returns:
            client.V1Job:
        """
        return self.create_job_object(
            image=component.image,
            name=f'component-validation-{component.id}',
            command=['python3', '--version', ],
            labels={
                'component_id': str(component.id),
                'job_type': self.component_validation_job_label
            },
            backofflimit=settings.NOTEBOOK_JOB_BACKOFF_LIMIT,
            active_deadline_seconds=settings.NOTEBOOK_VALIDATION_JOB_ACTIVE_DEADLINE,
            require_gpu=component.run_on_gpu
        )

    def supervise_component_validation_job(self, job: client.V1Job):
        """Method to check if job completed or failed, change notebook validation status accordingly and delete the job from cluster

        Args:
            job (client.V1Job): The job to supervise
        """
        if job.status.succeeded == 1 or job.status.failed == 1:
            component = Component.objects.get(
                id=job.metadata.labels['component_id'])
            component.run_validation = True
            component.success = bool(job.status.succeeded)
            component.save()
            logging.info(
                f'Validation of component with id "{job.metadata.labels["component_id"]}" is finished')
            self.delete_job(job)

    def delete_job(self, job: client.V1Job):
        """Delete job from k8s cluster

        Args:
            job (client.V1Job): The job to delete
        """

        try:
            job_name = job.metadata.name
            api_response = self.batch_v1.delete_namespaced_job(
                job_name,
                self.namespace,
                grace_period_seconds=0,
                propagation_policy='Background'
            )
            logging.info("Job deleted. status='%s'" % str(api_response.status))
        except ApiException as e:
            logging.error(
                "Exception when calling BatchV1Api->delete_namespaced_job: %s\n" % e)

    def start_notebook_execution(self) -> None:
        """Method to retrieve unfinished requests and start execution jobs"""
        label_selector = f'job_type={self.component_execution_job_label}'
        jobs = self.batch_v1.list_namespaced_job(
            namespace=self.namespace, label_selector=label_selector)
        number_requests_to_run = settings.NOTEBOOK_EXECUTOR_MAX_JOBS - \
            len(jobs.items)
        logger.info(f'Available execution limit: {number_requests_to_run}')

        if number_requests_to_run <= 0:
            return

        request_ids_list = [x.metadata.labels['request_id']
                            for x in jobs.items]
        not_executed_request = Request.objects.filter(
            started_at__isnull=True, component__run_validation=True, component__success=True
        ).exclude(id__in=request_ids_list).all()[:number_requests_to_run]
        logger.info(
            f'Number of requests to execute: {len(not_executed_request)}')

        if len(not_executed_request) == 0 and len(request_ids_list) == 0:
            logger.info('All request executed')
            return

        for request in not_executed_request:
            job = self.create_component_execution_job_desc(request)
            self.create_result_folder(request)
            self.start_job(job)
            request.started_at = localtime()
            request.save()

    def start_component_execution_jobs_supervision(self) -> None:
        """Retrieve notebook execution jobs and check them"""
        label_selector = f'job_type={self.component_execution_job_label}'
        jobs = self.batch_v1.list_namespaced_job(
            namespace=self.namespace, label_selector=label_selector)
        for job in jobs.items:
            self.supervise_component_execution_job(job)

    def supervise_component_execution_job(self, job: client.V1Job):
        """Method to supervise execution job, store results and delete job afterwards.

        Args:
            job (client.V1Job): Job to supervise
        """

        job_labels = job.metadata.labels
        pod_label_selector = f'controller-uid={job_labels["controller-uid"]}'
        logger.info(f"Start supervising job {job_labels['request_id']}")
        if job.status.succeeded == 1:
            pod_result = self.get_results_from_pods(pod_label_selector)
            request = Request.objects.get(id=job_labels['request_id'])
            request.calculated = True
            request.save()
            self.delete_job(job)

        if job.status.conditions is not None and job.status.conditions[0].type == 'Failed':
            logger.error("Job.status.conditions: 'Failed'")
            request = Request.objects.get(id=job_labels['request_id'])
            if job.status.conditions[0].message:
                collected_error = clean_container_logs(job.status.conditions[0].message)
                error_max_length = 350
                if len(collected_error) > error_max_length:
                    request.error = collected_error[len(collected_error) - error_max_length:]
                else:
                    request.error = collected_error
            request.save()
            self.delete_job(job)

        if job.status.failed in (1, 2):
            logger.error("Job.status.failed")
            pod_result = self.get_results_from_pods(pod_label_selector)
            request = Request.objects.get(id=job_labels['request_id'])
            request.finished_at = localtime()
            if pod_result['reason'] == 'Error':
                collected_error = clean_container_logs(pod_result['pod_log'])
                error_max_length = 350
                if len(collected_error) > error_max_length:
                    request.error = collected_error[len(collected_error) - error_max_length:]
                else:
                    request.error = collected_error
                logger.error(f"Job Error: {collected_error}")
            request.save()
            self.delete_job(job)

    def get_results_from_pods(self, pod_label_selector: str) -> Dict[str, str]:
        """Retrieve job execution results from pod. This is needed to store broad results about notebook execution to request

        Args:
            pod_label_selector (str): Label to determinate pod on which job is running

        Returns:
            Dict[str, str]: Example:
                        {
                            'pod_log': '',
                            'exit_code': 0,
                            'finished_at': datetime.datetime(2022, 10, 30, 9, 59, 8, tzinfo=tzlocal()),
                            'reason':  'Completed'
                        }
        """

        exit_code = None
        finished_at = None
        reason = None

        pods_list = self.core_v1.list_namespaced_pod(namespace=self.namespace,
                                                     label_selector=pod_label_selector,
                                                     timeout_seconds=10)
        pod_name = pods_list.items[0].metadata.name
        pod_state = pods_list.items[0].status.container_statuses[0].state
        pod_log_response = self.core_v1.read_namespaced_pod_log(name=pod_name,
                                                                namespace=self.namespace,
                                                                _return_http_data_only=True,
                                                                _preload_content=False
                                                                )
        pod_log = pod_log_response.data.decode("utf-8")
        if pod_state.terminated is not None:
            exit_code = pod_state.terminated.exit_code
            reason = pod_state.terminated.reason

        pod_result = dict(pod_log=pod_log,
                          exit_code=exit_code,
                          finished_at=finished_at,
                          reason=reason
                          )
        return pod_result

    @staticmethod
    def get_environment(request:Request) -> List[client.V1EnvVar]:
        """Return environment variables for k8s pod as list

        Args:
            request (Request):

        Returns:
            List[client.V1EnvVar]: 
        """
        env_dict = super(K8sNotebookHandler, K8sNotebookHandler).get_environment(request)
        return [client.V1EnvVar(key, value) for key, value in env_dict.items()]

    def create_component_execution_job_desc(self, request: Request) -> client.V1Job:
        """Create execution job description object from request

        Args:
            request (Request): Request to make job description from

        Returns:
            client.V1Job:
        """
        return self.create_job_object(
            image=request.component.image,
            name=f'execute-notebook-{str(request.id)}',
            labels={'request_id': str(
                request.id), 'job_type': self.component_execution_job_label},
            command=self.get_command(
                request.component,
                self.notebook_execution_script
            ),
            backofflimit=settings.NOTEBOOK_JOB_BACKOFF_LIMIT,
            active_deadline_seconds=settings.NOTEBOOK_EXECUTION_TIMEOUT,
            require_gpu=request.component.run_on_gpu,
            environment=self.get_environment(request)
        )
