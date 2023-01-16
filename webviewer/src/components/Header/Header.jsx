import React from 'react';

import { StyledHeader } from './Header.styles';

import { Logo } from 'components/Logo';
import { Userbar } from 'components/Userbar';
import { Menu } from './Menu';

export const Header = ({ ...props }) => {
  return (
    <StyledHeader {...props}>
      <Logo />
      <Menu />
      <Userbar />
    </StyledHeader>
  );
};
