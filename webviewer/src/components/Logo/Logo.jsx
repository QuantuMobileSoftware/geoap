import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '_constants';
import { StyledLogo } from './Logo.styles';
import { useDomainData } from 'hooks';

export const Logo = ({ ...props }) => {
  const { logo } = useDomainData();

  return (
    <Link to={ROUTES.ROOT}>
      <StyledLogo {...props}>
        <img src={logo} alt='Logo' />
      </StyledLogo>
    </Link>
  );
};
