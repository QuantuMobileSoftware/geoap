import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoImage } from 'assets/images/logo.svg';
import { ROUTES } from '_constants';
import { StyledLogo } from './Logo.styles';

export const Logo = ({ ...props }) => {
  return (
    <Link to={ROUTES.ROOT}>
      <StyledLogo {...props}>
        <LogoImage />
      </StyledLogo>
    </Link>
  );
};
