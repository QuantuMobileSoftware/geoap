import React from 'react';
import { useUserActions, useAreasActions } from 'state';
import { Button } from 'components/_shared/Button';
import { Header, Text } from './NewPassword.styles';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '_constants';

export const ConfirmCard = ({ isLogged }) => {
  const { resetAreasState } = useAreasActions();
  const { logout, stopAutoLogin } = useUserActions();
  const history = useHistory();

  const handleClick = () => {
    if (isLogged) {
      logout(true);
      resetAreasState();
    } else {
      stopAutoLogin(true);
      history.push(ROUTES.AUTH);
    }
  };

  return (
    <>
      <Header>Password changed</Header>
      <Text>
        Your password has been <br /> successfully changed
      </Text>
      <Button variant='primary' onClick={handleClick} fullWidth>
        Back to login
      </Button>
    </>
  );
};
