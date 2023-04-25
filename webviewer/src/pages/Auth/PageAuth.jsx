import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useUserActions, selectIsAuthorized, selectIsAutoLogged } from 'state';
import { FormPage } from 'components/_shared/Page';
import { AuthForm } from 'components/Auth';
import { Paper } from 'components/_shared/Paper';
import { Spinner } from 'components/_shared/Spinner';

const { REACT_APP_AUTOLOGIN, REACT_APP_AUTOPASSWORD } = process.env;

const autoLoginData = {
  username: REACT_APP_AUTOLOGIN,
  password: REACT_APP_AUTOPASSWORD
};

export const PageAuth = ({ ...props }) => {
  const { isLoading, error, login, getCurrentUser } = useUserActions();
  const isAuthorized = useSelector(selectIsAuthorized);
  const isAutoLogged = useSelector(selectIsAutoLogged);
  const [isShowSpinner, setIsShowSpinner] = useState(true);
  const canAutoLogin =
    !(isAuthorized || isAutoLogged) && REACT_APP_AUTOLOGIN && REACT_APP_AUTOPASSWORD;

  const handleSubmit = async values => {
    await login(values);
    await getCurrentUser();
  };

  useEffect(() => {
    if (canAutoLogin) {
      login(autoLoginData)
        .then(() => getCurrentUser())
        .finally(() => setIsShowSpinner(false));
    }
    setIsShowSpinner(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isShowSpinner) return <Spinner />;

  return (
    <FormPage {...props} header={false}>
      <Paper padding={4}>
        <AuthForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
      </Paper>
    </FormPage>
  );
};
