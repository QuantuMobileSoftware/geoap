import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hotjar } from 'react-hotjar';

import { ROUTES } from '_constants';
import { useUserActions, selectIsAuthorized } from 'state';

import { Route } from './Route';
import { PageAuth, PageMain } from 'pages';

const {
  REACT_APP_AUTOLOGIN,
  REACT_APP_AUTOPASSWORD,
  REACT_APP_HOTJAR_ID,
  REACT_APP_HOTJAR_SV
} = process.env;

export const Routes = () => {
  const { login } = useUserActions();
  const isAuthorized = useSelector(selectIsAuthorized);

  useEffect(() => {
    if (REACT_APP_HOTJAR_ID && REACT_APP_HOTJAR_SV) {
      hotjar.initialize(REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
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
    <Switch>
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
