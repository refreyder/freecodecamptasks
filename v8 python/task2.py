def add_time(start, duration, day=None):
    time_part, period = start.split()
    start_hour, start_min = map(int, time_part.split(':'))

    if period == 'PM' and start_hour != 12:
        start_hour += 12
    elif period == 'AM' and start_hour == 12:
        start_hour = 0

    dur_hour, dur_min = map(int, duration.split(':'))
    total_min = start_hour * 60 + start_min + dur_hour * 60 + dur_min

    days_later = total_min // 1440
    rem_min = total_min % 1440
    hour_24 = rem_min // 60
    minute = rem_min % 60

    new_period = 'AM' if hour_24 < 12 else 'PM'
    hour_12 = hour_24 % 12
    if hour_12 == 0:
        hour_12 = 12

    result = f'{hour_12}:{minute:02d} {new_period}'

    if day is not None:
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        new_day = days[(days.index(day.capitalize()) + days_later) % 7]
        result += f', {new_day}'

    if days_later == 1:
        result += ' (next day)'
    elif days_later > 1:
        result += f' ({days_later} days later)'

    return result
