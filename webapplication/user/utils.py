from datetime import datetime, timedelta

import pytz
from django.utils import timezone as dj_timezone


def day_window(local_date, tz_name):
    """Resolve a calendar date in an IANA zone to a half-open UTC interval [start, end)."""
    tz = pytz.timezone(tz_name)
    start = tz.localize(datetime.combine(local_date, datetime.min.time()))
    end = tz.localize(datetime.combine(local_date + timedelta(days=1), datetime.min.time()))
    return start.astimezone(pytz.utc), end.astimezone(pytz.utc)


def rolling_window(now=None):
    """Fixed trailing-24h half-open UTC interval [now - 24h, now)."""
    now = now or dj_timezone.now()
    return now - timedelta(hours=24), now
