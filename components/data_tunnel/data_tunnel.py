import os
import time

import requests

RETRY_INTERVAL_MINUTES = 1
RETRY_LIMIT_DAYS = 2
REQUEST_TIMEOUT = 10


def retry_request(interval_minutes=RETRY_INTERVAL_MINUTES, retry_limit_days=RETRY_LIMIT_DAYS):
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_ts = time.time()
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if time.time() - start_ts > retry_limit_days * 24 * 60 * 60:
                        raise Exception(f"Server doesn't respond more than {retry_limit_days} day(-s)")
                    print(f"Error: {e}. Retrying in {interval_minutes} minutes.")
                    time.sleep(interval_minutes * 60)
        return wrapper
    return decorator


@retry_request()
def get_component_id(name, url, params):
    response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if response.status_code != 200:
        raise Exception(f"Get Component ID error  - status code {response.status_code}")

    components_list = response.json()
    for component in components_list:
        if component.get("name", "") == name:
            return component.get("id")
    return None


@retry_request()
def get_user_id(url, params):
    response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if response.status_code != 200:
        raise Exception(f"Get User ID error  - status code {response.status_code}")
    return response.json().get("pk")


@retry_request()
def create_request(url, data, params):
    response = requests.post(url, data, params=params, timeout=REQUEST_TIMEOUT)
    if response.status_code not in (200, 201):  # TODO Left only 201
        raise Exception(f"Create Request error - status code {response.status_code}")
    return response.json()


@retry_request()
def wait_for_request_success_finish(url, params) -> (bool, str):
    response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if not response.status_code == 200:
        raise Exception(f"Check created Request error - status code {response.status_code}")
    curr_request = response.json()
    if not curr_request.get("calculated"):
        if curr_request.get("error") and curr_request.get("finished_at"):
            return False, curr_request.get("error")
        raise Exception("Not finished yet!")
    return True, ""


@retry_request()
def pull_results(created_request_id, url, params):
    response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
    if not response.status_code == 200:
        raise Exception(f"Pull results error  - status code {response.status_code}")
    paths = []
    for result in response.json():
        if result.get("request") == created_request_id:
            paths.append(result.get("filepath"))
    if not paths:
        raise Exception("No results yet!")
    return paths


@retry_request()
def download_result(url, params):
    headers = {'Accept-Encoding': 'gzip'}
    response = requests.get(url, stream=True, params=params, headers=headers, verify=False)
    if response.status_code == 200:
        return response
    raise Exception(f"Download result error  - status code {response.status_code}")


def save_result(dir_path, file_name, stream):
    chunk_size = 1024 * 1024  # 1 MB
    data_path = os.path.join(dir_path, file_name)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

    with open(data_path, 'wb') as f:
        for chunk in stream.iter_content(chunk_size=chunk_size):
            if chunk:
                f.write(chunk)


if __name__ == "__main__":
    api_key = os.getenv("API_KEY")
    api_endpoint = os.getenv("API_ENDPOINT")
    request_id = int(os.getenv("REQUEST_ID"))
    area = os.getenv("AOI")
    start_date = os.getenv("START_DATE")
    end_date = os.getenv("END_DATE")
    output_dir = os.getenv("OUTPUT_FOLDER")
    component_name = os.getenv("COMPONENT_NAME")

    if not api_key or not api_endpoint:
        raise Exception("API_KEY or API_ENDPOINT environment variable didn't passed")

    auth_param = {"apikey": api_key}
    components_url = api_endpoint + "api/notebook"
    current_user_url = api_endpoint + "api/users/current"
    request_create_url = api_endpoint + "api/request"
    pull_results_url = api_endpoint + "api/results"

    component_id = get_component_id(component_name, components_url, auth_param)
    user_id = get_user_id(current_user_url, auth_param)
    request = create_request(
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
    print(request)
    request_by_id_url = api_endpoint + f"api/request/{request.get('id')}"
    is_success, error_message = wait_for_request_success_finish(request_by_id_url, auth_param)
    if not is_success:
        raise Exception(error_message)

    paths_to_results = pull_results(
        created_request_id=request.get("id"),
        url=pull_results_url,
        params=auth_param
    )
    for path_to_result in paths_to_results:
        result_download_url = api_endpoint + f"results/{path_to_result}"
        data_stream = download_result(
            url=result_download_url,
            params=auth_param
        )
        save_result(
            dir_path=output_dir,
            file_name=os.path.basename(path_to_result),
            stream=data_stream
        )

