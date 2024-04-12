/*export function relative_date(date: Date, today: Date | null = null): string {
  today = today || new Date()
  if (date > today) {
    const delta_str = timedelta_to_str(date - today)
    return `in ${delta_str}`
  } else {
    const delta_str = timedelta_to_str(today - date)
    return `${delta_str} ago`
  }
}

export function timedelta_to_str(ms_delta: number): string {
  // Convert a timedelta to a human-readable string.
  if (delta < 0):
        // Don't allow negative deltas.
        throw Error(`delta must be positive, got ${delta}`)
  if (delta > Days(2)):
    return `${delta.days} days`
  if (delta > timedelta(hours = 1, minutes = 30)):
    return `${delta.days * 24 + delta.seconds / 3600} hours`
  return `${delta.seconds / 60} minutes`
}*/

export function nice_date(date: Date) {
  return date.toLocaleString()
}