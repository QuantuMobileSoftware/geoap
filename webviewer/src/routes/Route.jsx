import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route as ReactRoute } from 'react-router-dom';

import { ROUTES } from '_constants';

import { selectIsAuthorized } from 'state';

export const Route = ({ component: Component, isPrivate = false, ...props }) => {
  const { location, path } = props;
  const isAuthorized = useSelector(selectIsAuthorized);
  const guestRouts = [ROUTES.AUTH, ROUTES.SIGN_UP, ROUTES.FORGOT_PASSWORD];

  const renderRoute = props => {
    if ((!isPrivate || isAuthorized) && Component) {
      if (guestRouts.includes(path) && isAuthorized) {
        return <Redirect to={ROUTES.ROOT} />;
      }

      return <Component {...props} />;
    }

    return (
      <Redirect
        to={{
          pathname: ROUTES.AUTH,
          state: { prevLocation: location }
        }}
      />
    );
  };

  return <ReactRoute {...props} render={renderRoute} />;
};
