import React from 'react';
import { useSelector } from 'react-redux';
import { Notification } from './RemoteServerNotification.styles';
import { selectUser } from 'state';

export const RemoteServerNotification = () => {
  const user = useSelector(selectUser);
  if (user && user.server_for_calculation_is_needed && !user.remote_server_available) {
    return (
      <Notification>
        At the moment our server is overloaded with requests, we will definitely fulfill
        your request, but it may take a little longer
      </Notification>
    );
  }
  return null;
};
