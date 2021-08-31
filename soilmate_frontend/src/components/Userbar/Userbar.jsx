import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { StyledUserbar, UserbarAvatar, UserbarMenu, UserbarName } from './Userbar.styles';

import { Button } from 'components/_shared/Button';

import { selectUser, useUserActions } from 'state';
import { getStyledComponentClassName, getUserName } from 'utils';

export const Userbar = ({ ...props }) => {
  const menuRef = useRef(null);
  const user = useSelector(selectUser);
  const { logout } = useUserActions();

  return (
    <StyledUserbar {...props} onClick={() => menuRef.current.toggle()}>
      <UserbarAvatar src={user.avatar} backdropIcon='User' />

      <UserbarName>{getUserName(user)}</UserbarName>

      <UserbarMenu
        ref={menuRef}
        toggleIcon='ExpandDown'
        clickOutsideParams={{
          ignoredClassNames: [getStyledComponentClassName(StyledUserbar)]
        }}
      >
        <Button icon='Settings'>Settings</Button>
        <Button icon='LogOut' onClick={logout}>
          Log Out
        </Button>
      </UserbarMenu>
    </StyledUserbar>
  );
};