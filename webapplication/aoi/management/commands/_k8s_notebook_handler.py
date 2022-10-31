import logging
import os
from typing import Dict, List

from kubernetes import client, config
from kubernetes.client.rest import ApiException

from aoi.models import JupyterNotebook, Request
from django.conf import settings

from aoi.management.commands.executor import NotebookExecutor
import shutil

logger = logging.getLogger(__name__)

class K8sNotebookHandler():

    def __init__(self, namespace:str) -> None:
        config.load_incluster_config()
        self.core_v1 = client.CoreV1Api()
        self.batch_v1 = client.BatchV1Api()
        self.delete_options = client.V1DeleteOptions()
        self.namespace = namespace
        self.notebook_validation_job_label = "notebook-validation"
        self.notebook_execution_job_label = "notebook-execution"
        self.notebook_execution_script = self.notebook_executor_script_deliverer()

    @staticmethod
    def notebook_executor_script_deliverer() -> str:
        """Deliver NotebookExecutor.py script into volume that will be shared with notebook execution job pods

        Returns:
            str: path to file with notebook execution script
        """

        shutil.copy(NotebookExecutor.__file__, settings.PERSISTENT_STORAGE_PATH)
        notebook_execution_file = os.path.join(settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, os.path.basename(NotebookExecutor.__file__))
        logger.info(f'File "{NotebookExecutor.__file__}" with notebook execution script is delivered to "{notebook_execution_file}" ')
        return notebook_execution_file

    def start_job(self, job:client.V1Job):
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
            logger.info(f"Job created in namespace: '{self.namespace}'. status='{api_response.status}")
        except ApiException as e:
            logger.error(f'Exception when calling BatchV1Api->create_namespaced_job: {e}\n')

    @staticmethod
    def create_job_object(
        image:str, 
        name:str,
        labels:Dict[str, str],
        command:List[str],
        backofflimit:int=6,
        active_deadline_seconds:int=36_000,
        require_gpu=False
    
    ) -> client.V1Job:
        """StaticMethod. Creates job description.

        Args:
            image (str): Docker image name and tag
            name (str): Name of the future job
            labels (Dict[str, str]): Labels for k8s objects
            command (List[str]): Command to run in POD on startup
            backofflimit (int, optional): The number of retries before considering a Job as failed. Defaults to 6.
            active_deadline_seconds (int, optional): Active deadline, once a Job reaches it, 
                all of its running Pods are terminated and the Job status will become type: 
                Failed with reason: DeadlineExceeded. Defaults to 36_000s (10 hours).
            require_gpu (bool, optional): Whether or not job require GPU cores. Defaults to False

        Returns:
            client.V1Job
        """

        gpu_resouces = client.V1ResourceRequirements(
            limits={
                "nvidia.com/gpu":str(settings.GPU_CORES_PER_NOTEBOOK)
            }
        )
        notebook_volume = client.V1Volume(
            name='notebook-volume',
            persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                claim_name='sip-data-pvc'
            )
        )
        notebook_volume_mount = client.V1VolumeMount(
            name='notebook-volume',
            mount_path=settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH,
            read_only=False
        )
        container = client.V1Container(
            name=name,
            image=image,
            command=command,
            volume_mounts=[
                notebook_volume_mount,
            ],
            image_pull_policy='IfNotPresent',
            resources = gpu_resouces if require_gpu else None 
        )
        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(
                labels=labels,

            ),
            spec=client.V1PodSpec(
                containers=[container,],
                volumes=[notebook_volume,],
                restart_policy="Never",
                image_pull_secrets=[
                    {
                        'name':settings.IMAGE_PULL_SECRETS,
                    },
                ],
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

    def start_notebook_validation(self) -> None:
        """Method to retrieve not validated notebooks, create jobs to validate them and supervise results"""

        label_selector = f'job_type={self.notebook_validation_job_label}'
        jobs = self.batch_v1.list_namespaced_job(namespace=self.namespace, label_selector=label_selector)
        notebook_ids_list = [int(x.metadata.labels['notebook']) for x in jobs.items]
        not_validated_notebooks = JupyterNotebook.objects.filter(run_validation=False).exclude(id__in=notebook_ids_list)
        logger.info(f'Number of notebooks to validate: {len(not_validated_notebooks)}\n')

        for notebook in not_validated_notebooks:
            job_manifest = self.create_notebook_validation_job_manifest(notebook)
            self.start_job(job_manifest)
    
    def start_notebook_validation_jobs_supervision(self) -> None:
        """Retrieve notebook validation jobs and check them """
        label_selector = f'job_type={self.notebook_validation_job_label}'
        jobs = self.batch_v1.list_namespaced_job(namespace=self.namespace, label_selector=label_selector)
        for job in jobs.items:
            self.supervise_notebook_validation_job(job)
        
    def create_notebook_validation_job_manifest(self, notebook:JupyterNotebook) -> client.V1Job:
        """Method to create notebook validation job in k8s cluster

        Args:
            notebook (JupyterNotebook): Notebook instance to validate

        Returns:
            client.V1Job:
        """
        return self.create_job_object(
            image=notebook.image,
            name=f'notebook-validation-{notebook.id}',
            command=['python3', '--version', ],
            labels={
                'notebook':str(notebook.id),
                'job_type':self.notebook_validation_job_label
            },
            backofflimit=settings.NOTEBOOK_JOB_BACKOFF_LIMIT,
            active_deadline_seconds=settings.NOTEBOOK_VALIDATION_JOB_ACTIVE_DEADLINE,
            require_gpu=notebook.run_on_gpu
            
        )
       
    def supervise_notebook_validation_job(self, job:client.V1Job):
        """Method to check if job completed or failed, change notebook validation status accordingly and delete the job from cluster

        Args:
            job (client.V1Job): The job to supervise
        """
        if job.status.succeeded == 1 or job.status.failed == 1:
            notebook = JupyterNotebook.objects.get(id=job.metadata.labels['notebook'])
            notebook.run_validation = True
            notebook.success = True if job.status.succeeded == 1 else False
            notebook.save()
            logging.info(f'Validation of notebook with id "{job.metadata.labels["notebook"]}" is finished')
            self.delete_job(job)

    def delete_job(self, job:client.V1Job):
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
            logging.error("Exception when calling BatchV1Api->delete_namespaced_job: %s\n" % e)

    def start_notebook_execution(self) -> None:
        """Method to retrieve unfinished requests and start execution jobs"""
        label_selector = f'job_type={self.notebook_execution_job_label}'
        jobs = self.batch_v1.list_namespaced_job(namespace=self.namespace, label_selector=label_selector)
        number_requests_to_run = settings.NOTEBOOK_EXECUTOR_MAX_JOBS - len(jobs.items)
        logger.info(f'Available execution limit: {number_requests_to_run}')

        if number_requests_to_run <= 0:
            return

        request_ids_list = [x.metadata.labels['request_id'] for x in jobs.items]
        not_executed_request = Request.objects.filter(
            started_at__isnull=True, notebook__run_validation=True, notebook__success=True
        ).exclude(id__in=request_ids_list).all()[:number_requests_to_run]
        logger.info(f'Number of requests to execute: {len(not_executed_request)}')

        if len(not_executed_request) == 0 and len(request_ids_list) == 0:
            logger.info('All request executed')
            return

        for request in not_executed_request:
            job = self.create_notebook_execution_job_desc(request)
            self.start_job(job)

    def start_notebook_execution_jobs_supervision(self) -> None:
        """Retrieve notebook execution jobs and check them"""
        label_selector = f'job_type={self.notebook_execution_job_label}'
        jobs = self.batch_v1.list_namespaced_job(namespace=self.namespace, label_selector=label_selector)
        for job in jobs.items:
            self.supervise_notebook_execution_job(job)
    
    def supervise_notebook_execution_job(self, job:client.V1Job):
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
            request.started_at = pod_result['started_at']
            request.finished_at = pod_result['finished_at']
            request.calculated = True
            request.success = True
            request.save()
            self.delete_job(job)

        if job.status.conditions is not None and job.status.conditions[0].type == 'Failed':
            request = Request.objects.get(id=job_labels['request_id'])
            request.started_at = job.status.start_time
            if job.status.conditions[0].message:
                request.error = job.status.conditions[0].message
            request.save()
            self.delete_job(job)

        if job.status.failed in (1, 2):
            pod_result = self.get_results_from_pods(pod_label_selector)
            request = Request.objects.get(id=job_labels['request_id'])
            request.started_at = pod_result['started_at']
            request.finished_at = pod_result['finished_at']
            if pod_result['reason'] == 'Error':
                request.error = pod_result['pod_log']
                logger.error(f"Job Error: {pod_result['pod_log']}")
            request.save()
            self.delete_job(job)
            
    def get_results_from_pods(self, pod_label_selector:str) -> Dict[str, str]:
        """Retrieve job execution results from pod. This is needed to store broad results about notebook execution to request

        Args:
            pod_label_selector (str): Label to determinate pod on which job is running

        Returns:
            Dict[str, str]: Example:
                        {
                            'pod_log': '', 
                            'exit_code': 0, 
                            'started_at': datetime.datetime(2022, 10, 30, 9, 59, 5, tzinfo=tzlocal()), 
                            'finished_at': datetime.datetime(2022, 10, 30, 9, 59, 8, tzinfo=tzlocal()), 
                            'reason':  'Completed'
                        }
        """

        exit_code = None
        finished_at = None
        reason = None
        started_at = None
        
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
            started_at = pod_state.terminated.started_at
            finished_at = pod_state.terminated.finished_at
            reason = pod_state.terminated.reason
        
        pod_result = dict(pod_log=pod_log,
                          exit_code=exit_code,
                          started_at=started_at,
                          finished_at=finished_at,
                          reason=reason
                          )
        return pod_result

    def create_notebook_execution_job_desc(self, request:Request) -> client.V1Job:
        """Create execution job description object from request

        Args:
            request (Request): Request to make job description from

        Returns:
            client.V1Job:
        """
        return self.create_job_object(
            image=request.notebook.image,
            name=f'execute-notebook-{str(request.id)}',
            labels={'request_id': str(request.id), 'job_type': self.notebook_execution_job_label},
            command=[
                'python3', self.notebook_execution_script,
                '--input_path', request.notebook.path,
                '--request_id', str(request.id),
                '--aoi', f'{request.polygon.wkt}',
                '--start_date', request.date_from,
                '--end_date', request.date_to,
                '--cell_timeout', str(settings.CELL_EXECUTION_TIMEOUT),
                '--notebook_timeout', str(settings.NOTEBOOK_EXECUTION_TIMEOUT),
                '--kernel', request.notebook.kernel_name if request.notebook.kernel_name else ""
            ],
            backofflimit=settings.NOTEBOOK_JOB_BACKOFF_LIMIT,
            active_deadline_seconds=settings.NOTEBOOK_EXECUTION_TIMEOUT,
            require_gpu=request.notebook.run_on_gpu
        )