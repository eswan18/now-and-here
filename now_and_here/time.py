from datetime import datetime, timedelta


def relative_time(dt: datetime, today=datetime.now) -> str:
    # If today is a callable, call it to get the current date.
    if callable(today):
        today = today()
    delta = dt - today
    if delta > timedelta(days=2):
        return f"in {delta.days} days"
    if delta > timedelta(hours=1, minutes=30):
        return f"in {delta.seconds // 3600} hours"
    return f"in {delta.seconds // 60} minutes"
