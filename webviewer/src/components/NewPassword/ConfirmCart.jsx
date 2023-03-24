import React from 'react';
import { useUserActions, useAreasActions } from 'state';
import { Button } from 'components/_shared/Button';
import { Header, Text } from './NewPassword.styles';

export const ConfirmCard = () => {
  const { resetAreasState } = useAreasActions();
  const { logout } = useUserActions();

  const handleClick = () => {
    logout(true);
    resetAreasState();
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
