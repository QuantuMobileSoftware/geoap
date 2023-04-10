import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { contactUsState } from 'state';
import { ContactUs } from 'components/ContactUs';
import { Logo } from 'components/Logo';
import { Userbar } from 'components/Userbar';
import { Menu } from './Menu';
import { StyledHeader } from './Header.styles';

export const Header = memo(function ({ ...props }) {
  const openContactUs = useSelector(contactUsState);

  return (
    <StyledHeader {...props}>
      <Logo />
      <Menu />
      <Userbar />
      {openContactUs && <ContactUs />}
    </StyledHeader>
  );
});
