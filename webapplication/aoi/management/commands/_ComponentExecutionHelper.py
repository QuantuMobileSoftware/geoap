import json
import os
from typing import Dict, Optional, List
from aoi.models import Component, Request
from django.conf import settings

class ComponentExecutionHelper():
    """This is a class to posses common functionality
    for k8s and docker component executors
    """
    
    @staticmethod
    def get_environment(request:Request) -> Dict[str, str]:
        """Return dict of environment variables names (as keys) and values
        for given request

        Returns:
            Dict[str, str]:
        """

        env_variables = {
            'REQUEST_ID':str(request.pk),
            'AOI':request.aoi.polygon.wkt,
        }
        env_update = {
            'OUTPUT_FOLDER':os.path.join(
                settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, 
                str(settings.RESULTS_FOLDER). \
                    replace(os.path.commonpath([settings.RESULTS_FOLDER, settings.PERSISTENT_STORAGE_PATH])+'/', ''), 
                f"request_{request.pk}"
            ),
            'SENTINEL2_CACHE':os.path.join(
                settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, 
                str(settings.SATELLITE_IMAGES_FOLDER). \
                    replace(os.path.commonpath([settings.SATELLITE_IMAGES_FOLDER, settings.PERSISTENT_STORAGE_PATH])+'/', '')
            )
        }
        if request.component.period_required:
            env_update.update({
                'START_DATE':request.date_from.strftime("%Y-%m-%d"),
                'END_DATE':request.date_to.strftime("%Y-%m-%d")
            })
        if request.component.sentinel_google_api_key_required:
            env_update.update({
                'SENTINEL2_GOOGLE_API_KEY':os.path.join(settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, settings.SENTINEL2_GOOGLE_API_KEY)
            })
        if request.component.planet_api_key_required:
            env_update.update({
                'PLANET_API_KEY':request.user.planet_api_key
            })
        if request.component.sentinel1_aws_creds_required:
            env_update.update({
                'SENTINEL1_AWS_CREDS':os.path.join(settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, settings.SENTINEL1_AWS_CREDS)
            })
        if request.component.scihub_creds_required:
            env_update.update({
                'SCIHUB_CREDS':os.path.join(settings.NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH, settings.SCIHUB_CREDS)
            })
        if request.component.additional_parameter:
            env_update.update(
                {
                    request.component.additional_parameter:request.additional_parameter
                }
            )
        env_variables.update(env_update)
        return env_variables
    
    @staticmethod
    def get_command(component:Component, path_to_executor: Optional[str]=None) -> List[str]:
        """Return command for Docker or K8s Container """
        command = None
        if component.is_notebook:
            command = [
                "python", 
                path_to_executor,
                "--input_path",
                component.notebook_path,
                "--cell_timeout",
                str(settings.CELL_EXECUTION_TIMEOUT),
                "--notebook_timeout",
                str(settings.NOTEBOOK_EXECUTION_TIMEOUT),
                "--kernel",
                component.kernel_name,
            ]
            if component.additional_parameter:
                command.extend(
                    "--parameter_name",
                    component.additional_parameter
                )
        elif component.command:
            command = json.loads(component.command)    
        return command

    @staticmethod
    def create_result_folder(request:Request) -> None:
        """Create special folder to store results of request"""
        os.makedirs(
            os.path.join(
                settings.RESULTS_FOLDER,
                f"request_{request.pk}"
            ),
            exist_ok=True
        )


