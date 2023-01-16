import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import { hotjar } from 'react-hotjar';

import { ROUTES } from '_constants';

import { Route } from './Route';
import { PageAuth, PageMain } from 'pages';

const { REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV } = process.env;

export const Routes = () => {
  useEffect(() => {
    if (REACT_APP_HOTJAR_ID && REACT_APP_HOTJAR_SV) {
      hotjar.initialize(REACT_APP_HOTJAR_ID, REACT_APP_HOTJAR_SV);
    }
  }, []);

  return (
    <Switch>
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
