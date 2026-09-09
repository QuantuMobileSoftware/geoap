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
