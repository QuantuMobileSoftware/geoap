import React, { useEffect, useState } from 'react';
import { Header, CardText, ResendButton, CardWrap } from './VerifyCard.styles';

const TIMER_TIME = 20;

export const VerifyCard = ({ email, onResend }) => {
  const [time, setTime] = useState(null);

  const handleClick = () => {
    onResend();
    setTime(TIMER_TIME);
  };

  useEffect(() => {
    if (time === 0) setTime(null);
    if (time === null) return;
    const timer = setInterval(() => {
      setTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  return (
    <CardWrap>
      <Header>Please verify your email</Header>
      <CardText>
        We’ve sent a verification link to <br />
        {email}
      </CardText>
      <ResendButton disabled={time} onClick={handleClick}>
        Resend the link
      </ResendButton>
      {time && `00:${time}`}
    </CardWrap>
  );
};
