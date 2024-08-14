import os
from geoapp_client import GeoappClient


if __name__ == "__main__":
    area = "SRID=4326;" + os.getenv("AOI")
    request_id = int(os.getenv("REQUEST_ID"))
    start_date = os.getenv("START_DATE")
    end_date = os.getenv("END_DATE")
    output_dir = os.getenv("OUTPUT_FOLDER")
    component_name = os.getenv("COMPONENT_NAME")
    geoap_creds = os.getenv("GEOAP_CREDS")
    additional_parameter_name = os.getenv("ADDITIONAL_PARAMETER_NAME", "")
    if additional_parameter_name:
        additional_parameter_value = os.getenv(additional_parameter_name)
    additional_parameter2_name = os.getenv("ADDITIONAL_PARAMETER2_NAME", "")
    if additional_parameter2_name:
        additional_parameter2_value = os.getenv(additional_parameter2_name)

    geoapp_client = GeoappClient(geoap_creds)
    component_id = geoapp_client.get_component_id(component_name)
    user_id = geoapp_client.get_user_id()

    data = {
        "user": user_id,
        "notebook": component_id,
        "polygon": area,
        "date_from": start_date if start_date else "",
        "date_to": end_date if end_date else "",
    }
    if additional_parameter_name:
        data["additional_parameter"] = additional_parameter_value
    if additional_parameter2_name:
        data["additional_parameter2"] = additional_parameter2_value

    request = geoapp_client.create_request(data=data)
    is_success, error_message = geoapp_client.wait_for_request_success_finish(
        request.get("id")
    )
    if not is_success:
        raise Exception(error_message)
    paths_to_results = geoapp_client.pull_results(request.get("id"))
    for path_to_result in paths_to_results:
        geoapp_client.download_stream_and_save_results(path_to_result, output_dir)
    geoapp_client.check_files_amount(output_dir, len(paths_to_results))
