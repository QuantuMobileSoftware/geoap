const SECOND_MS = 1000;
const MINUTE_S = 60;
const HOUR_S = 60 * MINUTE_S;
const DAY_S = 24 * HOUR_S;

export const formatRelativeTime = (date, now = new Date()) => {
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - new Date(date).getTime()) / SECOND_MS)
  );

  if (seconds < MINUTE_S) return `${seconds} s ago`;
  if (seconds < HOUR_S) return `${Math.round(seconds / MINUTE_S)} min ago`;
  if (seconds < DAY_S) {
    const hours = Math.floor(seconds / HOUR_S);
    const minutes = Math.floor((seconds % HOUR_S) / MINUTE_S);
    return `${hours} h ${minutes} min ago`;
  }
  return `${Math.floor(seconds / DAY_S)} days ago`;
};
