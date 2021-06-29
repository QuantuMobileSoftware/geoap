import React from 'react';
import { StyledPopup, Header } from './Popup.styled';
import { Button } from '../Button';

export const Popup = ({ header, confirmPopup, cancel, save }) => (
  <StyledPopup>
    <Header>{header}</Header>
    <Button variant='secondary' onClick={cancel}>
      Cancel
    </Button>
    <Button variant='primary' onClick={save}>
      {confirmPopup}
    </Button>
  </StyledPopup>
);
