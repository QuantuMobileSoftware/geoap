import json
import time
import os

RETRY_INTERVAL = 2880  # num of intervals -> every minute
RETRY_LIMIT_DAYS = 172800.0  # 2 days in seconds
REQUEST_TIMEOUT = 10


def get_component_id(http_request, name, url, params):
    response = http_request.request('GET', url, fields=params)
    if response.status != 200:
        raise Exception(
            f"Get Component ID error  - status code {response.status_code}")

    components_list = json.loads(response.data.decode())
    for component in components_list:
        if component.get("name", "") == name:
            return component.get("id")
    return None


def get_user_id(http_request, url, params):
    response = http_request.request('GET', url, fields=params)
    if response.status != 200:
        raise Exception(
            f"Get User ID error  - status code {response.status_code}")
    return json.loads(response.data.decode()).get("pk")


def create_request(http_request, url, data, params):
    response = http_request.request(
        'POST', url + f"?apikey={params['apikey']}", fields=data)
    if response.status not in (200, 201):  # TODO Left only 201
        raise Exception(
            f"Create Request error - status code {response.status_code}")
    return json.loads(response.data.decode())


def wait_for_request_success_finish(http_request, url, params, logger):
    start_time = time.time()
    logger.info(
        f"wait_for_request_success started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")
    while time.time() < start_time + RETRY_LIMIT_DAYS:
        response = http_request.request('GET', url, fields=params)
        curr_request = json.loads(response.data.decode())
        if not curr_request.get("calculated"):
            if curr_request.get("error") and curr_request.get("finished_at"):
                return False, curr_request.get("error")
            logger.info(
                f"Not calculated: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))}")
        else:
            return True, ""
        time.sleep(60)
    return False, f"Not finished during {RETRY_LIMIT_DAYS} seconds"


def pull_results(http_request, created_request_id, url, params, logger):
    start_time = time.time()
    paths = []
    logger.info(
        f"pull_results started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time))}")
    while time.time() < start_time + RETRY_LIMIT_DAYS:
        response = http_request.request('GET', url, fields=params)
        curr_request = json.loads(response.data.decode())
        for result in curr_request:
            if result.get("request") == created_request_id:
                paths.append(result.get("filepath"))
        if paths:
            return paths
        else:
            logger.info(
                f"No results yet!: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))}")
            #TODO: need to be checked, we don't know how many responce files we have
            time.sleep(300)


def download_stream_and_save_results(http_request, url, dir_path, file_name, params, logger):
    logger.info(f"Started downloading")
    
    data_path = os.path.join(dir_path, file_name)
    logger.info(f"Data path:{data_path}")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
        logger.info(f"Created dir:{data_path}")
    
    headers = {'Accept-Encoding': 'gzip'}
    req = http_request.request(
        'GET', url, fields=params, headers=headers, preload_content=False)

    logger.info("Started writing result")
    with open(data_path, 'wb') as f:
        for chunk in req.stream(1024):
            f.write(chunk)
    req.release_conn()
    logger.info("Finished writing result, closed connection")
