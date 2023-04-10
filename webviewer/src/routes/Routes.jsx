import React, { useEffect, useState } from 'react';
import { Switch } from 'react-router-dom';
import { hotjar } from 'react-hotjar';
import { useUserActions } from 'state';
import { ROUTES } from '_constants';

import { Route } from './Route';
import { PageAuth, PageMain, SingUp, Account, ChangePassword } from 'pages';
import { ForgotPassword } from 'pages/ForgotPassword';
import { Spinner } from 'components/_shared/Spinner';

const { REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV } = process.env;

export const Routes = () => {
  const { getCurrentUser } = useUserActions();
  const [load, setLoad] = useState(true);

  useEffect(() => {
    getCurrentUser().finally(() => setLoad(false));
  }, [getCurrentUser]);

  useEffect(() => {
    if (REACT_APP_HOTJAR_ID && REACT_APP_HOTJAR_SV) {
      hotjar.initialize(REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV);
    }
  }, []);

  if (load) return <Spinner />;

  return (
    <Switch>
      <Route path={ROUTES.ACCOUNT} component={Account} isPrivate />
      <Route path={ROUTES.SIGN_UP_CONFIRM} component={SingUp} />
      <Route path={ROUTES.SIGN_UP} component={SingUp} />
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route path={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
      <Route path={ROUTES.CONFIRM_PASSWORD} component={ChangePassword} />
      <Route isPrivate path={ROUTES.RESET_PASSWORD} component={ChangePassword} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
