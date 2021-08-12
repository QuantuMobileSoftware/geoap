import logging
from pathlib import Path
from django.core import management
from kubernetes import client, config
from kubernetes.client.rest import ApiException
from django.conf import settings
from aoi.models import Request, JupyterNotebook
import time

logger = logging.getLogger(__name__)


class Job:
    def __init__(self, namespace):
        logger.info(f'init Job: namespace-{namespace}')
        config.load_incluster_config()
        self.core_v1 = client.CoreV1Api()
        self.batch_v1 = client.BatchV1Api()
        self.delete_options = client.V1DeleteOptions()
        self.namespace = namespace
        self._all_requests_executed = False
        
    def get_results_from_pods(self, pod_label_selector):
        exit_code = None
        finished_at = None
        message = None
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
                          reason=reason,
                          message=message
                          )
        return pod_result
        
    def _process_notebook_validation_jobs(self):
        label_selector = 'job_type=validate-notebook'
        not_validated_notebooks = JupyterNotebook.objects.filter(run_validation=False)
        for notebook in not_validated_notebooks:
            job_obj = self.create_validate_notebook_job_object(notebook)
            try:
                self.create_job(job_obj)
            except ApiException as e:
                logger.error(f'Exception when calling BatchV1Api->create_namespaced_job: {e}\n')

        jobs = self._get_running_jobs_by_label(label_selector)
        logger.info(f'validate-notebook_jobs amount: {len(jobs.items)}')
        while len(jobs.items) > 0:
            for job in jobs.items:
                self._delete_notebook_validate_job(job)
            time.sleep(20)
            jobs = self._get_running_jobs_by_label(label_selector)
            
    @staticmethod
    def _get_executing_request_ids(jobs):
        """
        return list of id for executing requests
        @param jobs: V1JobList
        @return: list of int
        """
        jobs_list_items = jobs.items
        request_id_list = []
        for job in jobs_list_items:
            request_id_list.append(job.metadata.labels['request_id'])
        return request_id_list
    
    def _run_execute_notebook_job(self):
        label_selector = 'job_type=execute-notebook'
        jobs = self._get_running_jobs_by_label(label_selector)
        number_requests_to_run = settings.NOTEBOOK_EXECUTOR_MAX_NOTEBOOKS_IN_PROGRESS - len(jobs.items)
        logger.info(f'number_requests_to_run: {number_requests_to_run}')
        if number_requests_to_run <= 0:
            return
   
        request_id_list = self._get_executing_request_ids(jobs)
        not_executed = Request.objects.filter(
            started_at__isnull=True, notebook__run_validation=True, notebook__success=True
        ).exclude(id__in=request_id_list)
        logger.info(f'amount of not executed requests in the database: {len(not_executed)}')
        if len(not_executed) == 0 and len(request_id_list) == 0:
            self._all_requests_executed = True
            logger.info('No requests to execute')
            return
        
        for not_executed_request in not_executed:
            job_object = self.create_execute_notebook_job_object(not_executed_request)
            self.create_job(job_object)
            number_requests_to_run -= 1
            if number_requests_to_run <= 0:
                return

    def _process_notebook_execute_jobs(self):
        while not self._all_requests_executed:
            self._run_execute_notebook_job()
            time.sleep(5)
            self._delete_notebook_execute_jobs()
            
    def _delete_notebook_execute_jobs(self):
        label_selector = 'job_type=execute-notebook'
        jobs = self._get_running_jobs_by_label(label_selector)
        for job in jobs.items:
            job_labels = job.metadata.labels
            controller_uid = job_labels["controller-uid"]
            pod_label_selector = f'controller-uid={controller_uid}'
            logger.info(f"request_id: {job_labels['request_id']} job.status: {job.status}")
            
            # print(f'job.status: {job.status}')
            
            if job.status.succeeded == 1:
                pod_result = self.get_results_from_pods(pod_label_selector)
                request = Request.objects.get(id=job_labels['request_id'])
                request.started_at = pod_result['started_at']
                request.finished_at = pod_result['finished_at']
                request.calculated = True
                request.success = True
                request.save()
                self._delete_job(job)
                management.call_command("publish")
            
            if job.status.conditions is not None and job.status.conditions[0].type == 'Failed':
                request = Request.objects.get(id=job_labels['request_id'])
                request.started_at = job.status.start_time
                if job.status.conditions[0].message:
                    request.error = job.status.conditions[0].message
                request.save()
                self._delete_job(job)
                
            if job.status.failed in (1, 2):
                request = Request.objects.get(id=job_labels['request_id'])
                try:
                    pod_result = self.get_results_from_pods(pod_label_selector)
                    request.started_at = pod_result['started_at']
                    request.finished_at = pod_result['finished_at']
                    print(pod_result)
                    if pod_result['reason'] == 'Error' and not pod_result['message']:
                        request.error = pod_result['pod_log']
                        logger.error(f"Job Error: {pod_result['pod_log']}")
                except ApiException as e:
                    request.error = f'not able to get pod_result, {e}'
                    request.started_at = job.status.start_time
                request.save()
                self._delete_job(job)
    
    def _delete_notebook_validate_job(self, job):
        job_labels = job.metadata.labels
        logger.info(f'job_labels: {job_labels}')
        if job.status.succeeded == 1 or job.status.failed == 1:
            notebook = JupyterNotebook.objects.get(id=job_labels['notebook_id'])
            notebook.run_validation = True
            notebook.success = True if job.status.succeeded == 1 else False
            notebook.save()
            self._delete_job(job)
        
    def handle(self):
        self._process_notebook_validation_jobs()
        self._process_notebook_execute_jobs()
        return
        
    def _get_running_jobs_by_label(self, label_selector):
        return self.batch_v1.list_namespaced_job(self.namespace, label_selector=label_selector)
    
    def create_validate_notebook_job_object(self, notebook):
        image = notebook.image
        notebook_id = str(notebook.id)
        job_name = f'validate-notebook-{notebook_id}'
        validate_command = ['python3', '--version', ]
        labels = {'notebook_id': notebook_id, 'job_type': 'validate-notebook'}
        return self._create_job_object(job_name, image, labels, validate_command,
                                       backoff_limit=settings.VALIDATE_NOTEBOOK_BACKOFF_LIMIT,
                                       active_deadline_seconds=settings.VALIDATE_NOTEBOOK_ACTIVE_DEADLINE_SECONDS)
    
    def create_execute_notebook_job_object(self, request):
        job_name = f'execute-notebook-{str(request.id)}'
        image = request.notebook.image
        kernel = request.notebook.kernel_name if request.notebook.kernel_name else ""
        notebook_path_original = Path(request.notebook.path)
        logger.info(f'Notebook original path: {notebook_path_original}')
        notebook_name = notebook_path_original.name
        code_path = Path('/home/jovyan/code')
        executor_path = code_path / 'NotebookExecutor.py'
        path_to_execute = code_path / 'src' / notebook_name
        output_path = notebook_path_original.parent
        
        execute_command = [
            'python3', str(executor_path),
            '--path_to_execute', str(path_to_execute),
            '--output_path', str(output_path),
            '--request_id', str(request.id),
            '--aoi', f'{request.polygon.wkt}',
            '--start_date', request.date_from,
            '--end_date', request.date_to,
            '--cell_timeout', str(settings.CELL_EXECUTION_TIMEOUT),
            '--notebook_timeout', str(settings.NOTEBOOK_EXECUTION_TIMEOUT),
            '--kernel', kernel
           ]
        labels = {'request_id': str(request.id), 'job_type': 'execute-notebook'}
        return self._create_job_object(job_name, image, labels, execute_command,
                                       backoff_limit=settings.EXECUTE_NOTEBOOK_BACKOFF_LIMIT,
                                       active_deadline_seconds=settings.EXECUTE_NOTEBOOK_ACTIVE_DEADLINE_SECONDS)
    
    @staticmethod
    def _create_job_object(job_name, image, labels, command, backoff_limit=None, active_deadline_seconds=None,):
        nfs_notebook_volume = client.V1Volume(
            name='nfs-notebook-volume',
            persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name='nfs-sip-data-pvc')
        )
        
        nfs_notebook_volume_mount = client.V1VolumeMount(
            name='nfs-notebook-volume',
            mount_path='/home/jovyan/work',
            read_only=False
        )

        container = client.V1Container(
            name='jupyter',
            image=image,
            command=command,
            volume_mounts=[
                nfs_notebook_volume_mount,
            ],
            resources=client.V1ResourceRequirements(
                limits={'nvidia.com/gpu': '1'},
                # requests={'nvidia.com/gpu': 1}
            ),
            image_pull_policy='Always'
            # image_pull_policy='IfNotPresent'
        )
        logger.info(f'Using image_pull_secrets={settings.IMAGE_PULL_SECRETS} ')
        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(labels=labels),
            spec=client.V1PodSpec(containers=[container],
                                  volumes=[nfs_notebook_volume, ],
                                  restart_policy="Never",
                                  image_pull_secrets=[{'name': settings.IMAGE_PULL_SECRETS}, ],
                                  security_context={
                                      # 'run_as_user': 1001,
                                      'supplemental_groups': [0, 1001, 2000],
                                      # 'fs_group': 1000,
                                  }
                                  )
        )
        # Create the specification of deployment
        spec = client.V1JobSpec(
            template=template,
            backoff_limit=backoff_limit,
            active_deadline_seconds=active_deadline_seconds,
        )
        # Instantiate the job object
        job_obj = client.V1Job(
            api_version="batch/v1",
            kind="Job",
            metadata=client.V1ObjectMeta(name=job_name),
            spec=spec
        )
        return job_obj
    
    def create_job(self, job_obj):
        api_response = self.batch_v1.create_namespaced_job(
            body=job_obj,
            namespace=self.namespace,
            pretty=True
        )
        logger.info("Job created. status='%s'" % str(api_response.status))

    def _delete_job(self, job):
        job_name = job.metadata.name
        logging.info("Cleaning up Job: {}. Finished at: {}".format(job_name, job.status.completion_time))
        try:
            api_response = self.batch_v1.delete_namespaced_job(job_name,
                                                               self.namespace,
                                                               grace_period_seconds=0,
                                                               propagation_policy='Background')

        except ApiException as e:
            logging.info("Exception when calling BatchV1Api->delete_namespaced_job: %s\n" % e)
