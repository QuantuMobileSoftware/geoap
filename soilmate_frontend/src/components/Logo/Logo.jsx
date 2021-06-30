import React from 'react';

import { ReactComponent as LogoImage } from 'assets/images/logo.svg';

import { StyledLogo } from './Logo.styles';

export const Logo = ({ ...props }) => {
  return (
    <StyledLogo {...props}>
      <LogoImage />
    </StyledLogo>
  );
};
