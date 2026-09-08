"""Tunable constants for unit alert evaluation and telemetry."""

STATUS_THRESHOLDS = {
    'late_after_seconds': 5 * 60,
    'not_reporting_after_seconds': 60 * 60,
}

TRACK_POINT_CAP = 1500

# Heartbeat interval in seconds, per firmware
HEARTBEAT_INTERVAL_SECONDS = None
