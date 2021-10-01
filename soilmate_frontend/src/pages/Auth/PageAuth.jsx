import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { StyledPageAuth } from './PageAuth.styles';

import { AuthForm } from 'components/Auth';
import { Logo } from 'components/Logo';
import { Paper } from 'components/_shared/Paper';

import { useUserActions, selectIsAuthorized, selectIsAutoLogged } from 'state';

const { REACT_APP_AUTOLOGIN, REACT_APP_AUTOPASSWORD } = process.env;

export const PageAuth = ({ ...props }) => {
  const { isLoading, error, login } = useUserActions();
  const isAuthorized = useSelector(selectIsAuthorized);
  const isAutoLogged = useSelector(selectIsAutoLogged);
  const handleSubmit = values => login(values);

  useEffect(() => {
    if (isAuthorized || isAutoLogged) {
      return;
    }
    if (REACT_APP_AUTOLOGIN && REACT_APP_AUTOPASSWORD) {
      login({
        username: REACT_APP_AUTOLOGIN,
        password: REACT_APP_AUTOPASSWORD
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledPageAuth {...props} header={false}>
      <Paper padding={4}>
        <Logo />
        <AuthForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
      </Paper>
    </StyledPageAuth>
  );
};
