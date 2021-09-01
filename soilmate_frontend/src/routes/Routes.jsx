import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';

import { ROUTES } from '_constants';
import { useUserActions } from 'state';

import { Route } from './Route';
import { PageAuth, PageMain } from 'pages';

export const Routes = () => {
  const { login } = useUserActions();

  useEffect(() => {
    const { REACT_APP_AUTOLOGIN, REACT_APP_AUTOPASSWORD } = process.env;
    if (REACT_APP_AUTOLOGIN && REACT_APP_AUTOPASSWORD) {
      login({
        username: REACT_APP_AUTOLOGIN,
        password: REACT_APP_AUTOPASSWORD
      });
    }
  }, [login]);

  return (
    <Switch>
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
