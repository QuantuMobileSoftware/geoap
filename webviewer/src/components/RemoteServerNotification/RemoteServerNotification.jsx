import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { StyledHeader } from './RemoteServerNotification.styles';
import { selectUser } from 'state';

export const RemoteServerNotification = memo(function ({ ...props }) {
  const user = useSelector(selectUser);
  if (user && user.server_for_calculation_is_needed && !user.remote_server_available) {
    return (
      <StyledHeader {...props}>
        <div>
          At the moment our server is overloaded with requests, we will definitely fulfill
          your request, but it may take a little longer
        </div>
      </StyledHeader>
    );
  }
  return null;
});
