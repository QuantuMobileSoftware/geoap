import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '_constants';
import { StyledLogo } from './Logo.styles';

import defaultLogoSvg from 'assets/images/logo.svg';
import agrieosLogoPng from 'assets/images/agrieos-logo.png';

export const Logo = ({ ...props }) => {
  const domain = window.location.hostname;

  let logo = defaultLogoSvg;

  if (domain === 'agrieos.in') {
    logo = agrieosLogoPng;
  }
  return (
    <Link to={ROUTES.ROOT}>
      <StyledLogo {...props}>
        <img src={logo} alt='Logo' />
      </StyledLogo>
    </Link>
  );
};
