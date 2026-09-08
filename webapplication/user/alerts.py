"""Per-unit alert evaluation"""
from user.alert_config import STATUS_THRESHOLDS

RULES = {
    'not_reporting': {
        'severity': 'high',
        'copy': "This unit hasn't reported in over an hour. Check that it's powered on and back in coverage.",
    },
    'late': {
        'severity': 'medium',
        'copy': "This unit's last message came in later than usual. It may be moving in and out of coverage.",
    },
    'no_images': {
        'severity': 'high',
        'copy': "The camera sent no images in this window.",
    },
    'no_gps_fix': {
        'severity': 'medium',
        'copy': "Lost GPS location. This unit is online but not sending its position. Check the antenna connection.",
    },
    'detection_not_running': {
        'severity': 'high',
        'copy': "The unit is online, but detection isn't working. Restart it or contact support if it continues.",
    },
}

OK_ALERT = {'rule': 'ok', 'severity': 'ok', 'copy': "Everything looks normal for this unit."}


def _alert(rule):
    info = RULES[rule]
    return {'rule': rule, 'severity': info['severity'], 'copy': info['copy']}


def evaluate_unit_alerts(stream, last_received_at, now):
    """stream: merged coverage+prediction rows for the requested window (telemetry.StreamRow).
    last_received_at: most recent coverage message ever received for this unit, or None.
    now: current time, for the not_reporting/late liveness check."""
    alerts = []

    age_seconds = (now - last_received_at).total_seconds() if last_received_at is not None else None
    if age_seconds is None or age_seconds > STATUS_THRESHOLDS['not_reporting_after_seconds']:
        alerts.append(_alert('not_reporting'))
    elif age_seconds > STATUS_THRESHOLDS['late_after_seconds']:
        alerts.append(_alert('late'))

    if stream:
        if not any(row.image_path for row in stream):
            alerts.append(_alert('no_images'))

        coverage_stream = [row for row in stream if row.source == 'coverage']
        if coverage_stream:
            if all(row.location is None for row in coverage_stream):
                alerts.append(_alert('no_gps_fix'))
            if not any(row.source == 'prediction' for row in stream):
                alerts.append(_alert('detection_not_running'))

    return alerts or [OK_ALERT]
