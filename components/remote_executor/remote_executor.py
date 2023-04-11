import os
from geoapp_client import GeoappClient


if __name__ == "__main__":
    area = "SRID=4236;"+os.getenv("AOI")
    request_id = int(os.getenv("REQUEST_ID"))
    start_date = os.getenv("START_DATE")
    end_date = os.getenv("END_DATE")
    output_dir = os.getenv("OUTPUT_FOLDER")
    component_name = os.getenv("COMPONENT_NAME")
    geoap_creds = os.getenv("GEOAP_CREDS")

    geoapp_client = GeoappClient(geoap_creds)
    component_id = geoapp_client.get_component_id(component_name)
    user_id = geoapp_client.get_user_id()
    request = geoapp_client.create_request(data={
        "user": user_id,
        "notebook": component_id,
        "polygon": area,
        "date_from": start_date,
        "date_to": end_date
    })
    is_success, error_message = geoapp_client.wait_for_request_success_finish(
        request.get('id'))
    if not is_success:
        raise Exception(error_message)
    paths_to_results = geoapp_client.pull_results(request.get("id"))
    for path_to_result in paths_to_results:
        geoapp_client.download_stream_and_save_results(
            path_to_result, output_dir)
