import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hotjar } from 'react-hotjar';

import { ROUTES, HOTJAR_ID, HOTJAR_SV } from '_constants';
import { useUserActions, selectIsAuthorized } from 'state';

import { Route } from './Route';
import { PageAuth, PageMain } from 'pages';

export const Routes = () => {
  const { login } = useUserActions();
  const isAuthorized = useSelector(selectIsAuthorized);

  useEffect(() => hotjar.initialize(HOTJAR_ID, HOTJAR_SV), []);
  useEffect(() => {
    if (isAuthorized) {
      return;
    }
    const { REACT_APP_AUTOLOGIN, REACT_APP_AUTOPASSWORD } = process.env;
    if (REACT_APP_AUTOLOGIN && REACT_APP_AUTOPASSWORD) {
      login({
        username: REACT_APP_AUTOLOGIN,
        password: REACT_APP_AUTOPASSWORD
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Switch>
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
