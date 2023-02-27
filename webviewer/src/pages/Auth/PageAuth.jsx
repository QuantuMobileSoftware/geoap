import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { FormPage } from 'components/_shared/Page';
import { AuthForm } from 'components/Auth';
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
    <FormPage {...props} header={false}>
      <Paper padding={4}>
        <AuthForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
      </Paper>
    </FormPage>
  );
};
