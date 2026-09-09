import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserTimezone } from 'state';
import { useAccountClock } from 'hooks';
import { ACCOUNT_CLOCK_FORMAT_OPTIONS } from 'utils';
import { ClockText } from './AccountClock.styles';

export const AccountClock = React.memo(() => {
  const timezone = useSelector(selectUserTimezone);
  const time = useAccountClock(timezone, ACCOUNT_CLOCK_FORMAT_OPTIONS);

  if (!time) return null;

  return <ClockText>{time}</ClockText>;
});
