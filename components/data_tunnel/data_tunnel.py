import os
import urllib3
import logging
import utils
import json
from urllib3.util.retry import Retry


if __name__ == "__main__":
    area = "SRID=4236;"+os.getenv("AOI")
    request_id = int(os.getenv("REQUEST_ID"))
    start_date = os.getenv("START_DATE")
    end_date = os.getenv("END_DATE")
    output_dir = os.getenv("OUTPUT_FOLDER")
    component_name = os.getenv("COMPONENT_NAME")
    geoap_creds = os.getenv("GEOAP_CREDS")

    log = logging.getLogger('urllib3')
    log.setLevel(logging.DEBUG)
    log.addHandler(logging.StreamHandler())

    with open(geoap_creds, 'r') as f:
        geoap_creds_data = json.load(f)
    api_key = geoap_creds_data["API_KEY"]
    api_endpoint = geoap_creds_data["API_ENDPOINT"]

    auth_param = {"apikey": api_key}
    components_url = api_endpoint + "api/notebook"
    current_user_url = api_endpoint + "api/users/current"
    request_create_url = api_endpoint + "api/request"
    pull_results_url = api_endpoint + "api/results"

    retry_strategy = Retry(total=utils.RETRY_INTERVAL,
                           backoff_factor=60, status_forcelist=[502, 503, 504])
    timeout = urllib3.Timeout(
        total=utils.RETRY_LIMIT_DAYS, connect=10.0, read=10.0)
    http = urllib3.PoolManager(timeout=timeout, retries=retry_strategy)

    component_id = utils.get_component_id(
        http, component_name, components_url, auth_param)
    log.info(f"component_id: {component_id}")

    user_id = utils.get_user_id(http, current_user_url, auth_param)
    log.info(f"user_id: {user_id}")

    request = utils.create_request(
        http_request=http,
        url=request_create_url,
        data={
            "user": user_id,
            "notebook": component_id,
            "polygon": area,
            "date_from": start_date,
            "date_to": end_date
        },
        params=auth_param
    )
    log.info(f"request: {request}")

    request_by_id_url = api_endpoint + f"api/request/{request.get('id')}"
    is_success, error_message = utils.wait_for_request_success_finish(
        http, request_by_id_url, auth_param, log)
    if not is_success:
        raise Exception(error_message)
    log.info("Notebook calculated")

    paths_to_results = utils.pull_results(
        http_request=http,
        created_request_id=request.get("id"),
        url=pull_results_url,
        params=auth_param,
        logger=log
    )
    for path_to_result in paths_to_results:
        result_download_url = api_endpoint + f"results/{path_to_result}"

        utils.download_stream_and_save_results(http_request=http,
                                               url=result_download_url,
                                               dir_path=output_dir,
                                               file_name=os.path.basename(
                                                   path_to_result),
                                               params=auth_param,
                                               logger=log)
