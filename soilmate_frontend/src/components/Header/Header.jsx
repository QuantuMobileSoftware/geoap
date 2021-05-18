import React from 'react';

import { StyledHeader } from './Header.styles';

import { Logo } from 'components/Logo';
import { HeaderSearch } from './Search';
import { HeaderNotifications } from './Notifications';
import { Userbar } from 'components/Userbar';

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
