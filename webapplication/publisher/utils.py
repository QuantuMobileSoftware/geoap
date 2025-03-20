def gpx_to_json_format(gpx_data):
    gpx_json_data = {}
    for waypoint in gpx_data.waypoints:
        gpx_json_data[waypoint.description] = {
            "lat": str(waypoint.latitude),
            "lon": str(waypoint.longitude),
            "status": str(waypoint.comment),
        }
    return gpx_json_data
