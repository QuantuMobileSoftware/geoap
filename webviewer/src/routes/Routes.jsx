import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import { hotjar } from 'react-hotjar';
import { useUserActions } from 'state';
import { ROUTES } from '_constants';

import { Route } from './Route';
import { PageAuth, PageMain, SingUp, Account, ChangePassword } from 'pages';

const { REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV } = process.env;

export const Routes = () => {
  const { getCurrentUser } = useUserActions();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    if (REACT_APP_HOTJAR_ID && REACT_APP_HOTJAR_SV) {
      hotjar.initialize(REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV);
    }
  }, []);

  return (
    <Switch>
      <Route path={ROUTES.ACCOUNT} component={Account} isPrivate />
      <Route path={ROUTES.SIGN_UP_CONFIRM} component={SingUp} />
      <Route path={ROUTES.SIGN_UP} component={SingUp} />
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.RESET_PASSWORD} component={ChangePassword} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
