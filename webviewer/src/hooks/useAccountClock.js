import { useEffect, useState } from 'react';
import { formatInTimezone } from 'utils';

const TICK_MS = 1000;

export const useAccountClock = (timezone, formatOptions) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(intervalId);
  }, []);

  if (!timezone) return null;

  return formatInTimezone(now, timezone, formatOptions);
};
