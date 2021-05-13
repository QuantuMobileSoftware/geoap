import React from 'react';
import { Redirect, Route as ReactRoute } from 'react-router-dom';

import { ROUTES } from '_constants';

export const Route = ({ component: Component, isPrivate = false, ...props }) => {
  const { location } = props;
  const isAuthorized = true; // TODO: Replace with sate value

  const renderRoute = props => {
    if ((!isPrivate || isAuthorized) && Component) {
      if (location.pathname.match(ROUTES.AUTH) && isAuthorized) {
        return <Redirect to={location.state?.prevLocation || ROUTES.ROOT} />;
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
