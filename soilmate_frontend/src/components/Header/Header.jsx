import React from 'react';

import { StyledHeader } from './Header.styles';

import { Logo } from 'components/Logo';
import { Userbar } from 'components/Userbar';
import { HeaderSearch } from './Search';
import { HeaderNotifications } from './Notifications';

export const Header = ({ ...props }) => {
  return (
    <StyledHeader {...props}>
      <Logo />
      <HeaderSearch />
      <HeaderNotifications />
      <Userbar />
    </StyledHeader>
  );
};
