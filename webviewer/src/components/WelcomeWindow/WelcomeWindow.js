import React, { useState } from 'react';
import { Analytics } from './components/Analytics';
import { STORAGE_WELCOME_KEY } from '_constants';
import {
  Services,
  ServiceItem,
  StyledWindow,
  Header,
  Title,
  StyledButton,
  CheckboxWrap
} from './WelcomeWindow.styles';

export const WelcomeWindow = ({ onClose }) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleClick = e => setIsChecked(e.target.checked);
  const handleClose = () => onClose(isChecked);

  return (
    <StyledWindow>
      <Header>Welcome to SoilMate</Header>
      <Title> Your best geoanalytical service powered with AI </Title>
      <Services>
        <ServiceItem>1. Define your area of interest (AOI)</ServiceItem>
        <ServiceItem>
          2. Request for specific analytics with out-of-the-box AI tools
        </ServiceItem>
        <ServiceItem>3. Get your data visualization reports</ServiceItem>
      </Services>
      <Analytics />
      <StyledButton variant='primary' onClick={handleClose}>
        Got it
      </StyledButton>
      <CheckboxWrap>
        <input
          type='checkbox'
          id={STORAGE_WELCOME_KEY}
          onChange={handleClick}
          checked={isChecked}
        />
        <label htmlFor={STORAGE_WELCOME_KEY}>Do not show this screen again</label>
      </CheckboxWrap>
    </StyledWindow>
  );
};
