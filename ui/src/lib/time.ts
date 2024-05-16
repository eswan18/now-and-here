export function yesterday() {
  const now = new Date();
  return new Date(now.setDate(now.getDate() - 1));
}

export function relativeTimeString(d: Date, now: Date | undefined = undefined): string {
  if (!now) {
    now = new Date();
  }
  const diff = now.getTime() - d.getTime();
  const absDiff = Math.abs(diff);

  if (absDiff < 60 * 1000) {
    return 'just now';
  }
  
  const timedeltaString = absDiff < 60 * 60 * 1000
    ? `${Math.floor(absDiff / (60 * 1000))} minutes`
    : absDiff < 24 * 60 * 60 * 1000
      ? `${Math.floor(absDiff / (60 * 60 * 1000))} hours`
      : absDiff < 7 * 24 * 60 * 60 * 1000
        ? `${Math.floor(absDiff / (24 * 60 * 60 * 1000))} days`
        : d.toLocaleDateString();
  return diff < 0 ? `in ${timedeltaString}` : `${timedeltaString} ago`;
}