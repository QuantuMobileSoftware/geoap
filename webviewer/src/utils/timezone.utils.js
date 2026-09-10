export const ACCOUNT_CLOCK_FORMAT_OPTIONS = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
};

export const createTimezoneFormatter = (timezone, options) =>
  new Intl.DateTimeFormat(undefined, { ...options, timeZone: timezone });

export const formatInTimezone = (date, timezone, options) =>
  createTimezoneFormatter(timezone, options).format(date);

// 'en-CA' gives YYYY-MM-DD, the format the API expects.
export const getAccountToday = (timezone, now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

// Shifts a YYYY-MM-DD string by whole days. No timezone needed for this.
export const shiftDate = (isoDate, deltaDays) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + deltaDays)).toISOString().slice(0, 10);
};

// Formats a YYYY-MM-DD date. Forced to UTC so the browser's own timezone
// can't shift it to the wrong day.
export const formatAccountDay = isoDate =>
  new Intl.DateTimeFormat(undefined, {
    timeZone: 'UTC',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${isoDate}T00:00:00Z`));
