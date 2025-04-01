import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'state';
import { Notification, StyledButton } from './RemoteServerNotification.styles';

export const RemoteServerNotification = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user?.server_for_calculation_is_needed && !user?.remote_server_available) {
      setIsOpen(true);
    }
  }, [user]);

  if (isOpen) {
    return (
      <Notification>
        <StyledButton
          variant='secondary'
          icon='Cross'
          onClick={() => setIsOpen(false)}
        ></StyledButton>
        At the moment our server is overloaded with requests, we will definitely fulfill
        your request, but it may take a little longer
      </Notification>
    );
  }
  return null;
};
