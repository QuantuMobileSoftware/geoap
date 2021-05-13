import React from 'react';
import { Switch } from 'react-router-dom';

import { ROUTES } from '_constants';

import { Route } from './Route';
import { PageAuth, PageMain } from 'pages';

export const Routes = () => {
  return (
    <Switch>
      <Route path={ROUTES.AUTH} component={PageAuth} />
      <Route isPrivate path={ROUTES.ROOT} component={PageMain} />
    </Switch>
  );
};
