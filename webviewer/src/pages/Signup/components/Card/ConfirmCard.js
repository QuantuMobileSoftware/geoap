import React from 'react';
import { Button } from 'components/_shared/Button';
import { Header, CardText, CardWrap } from './Card.styles';
import { useHistory } from 'react-router-dom';
import { DEFAULT_ERROR, ROUTES } from '_constants';

export const ConfirmCard = ({ error }) => {
  const history = useHistory();

  if (error)
    return (
      <CardWrap center>
        <Header>{DEFAULT_ERROR}</Header>
        <CardText error='true'>{error}</CardText>
        <Button variant='primary' onClick={() => history.push(ROUTES.SIGN_UP)} fullWidth>
          Back
        </Button>
      </CardWrap>
    );

  return (
    <CardWrap center>
      <Header>Welcome! &#128075;</Header>
      <CardText>
        Your account has been
        <br /> successfully created
      </CardText>
      <Button variant='primary' onClick={() => history.push(ROUTES.AUTH)} fullWidth>
        Continue
      </Button>
    </CardWrap>
  );
};
