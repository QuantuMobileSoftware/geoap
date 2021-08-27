import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'components/_shared/Modal';

import {
  StyledUserbar,
  UserbarAvatar,
  UserbarMenu,
  UserbarName,
  ButtonWrapper
} from './Userbar.styles';

import { Button } from 'components/_shared/Button';

import { selectUser, useUserActions, useAreasActions } from 'state';
import { getStyledComponentClassName, getUserName } from 'utils';

export const Userbar = ({ ...props }) => {
  const menuRef = useRef(null);
  const user = useSelector(selectUser);
  const { logout } = useUserActions();
  const { resetAreasState } = useAreasActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogOut = () => {
    logout();
    resetAreasState();
  };

  const handleToggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
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
          <Button icon='LogOut' onClick={handleToggleModal}>
            Log Out
          </Button>
        </UserbarMenu>
      </StyledUserbar>
      {isModalOpen && (
        <Modal
          header='Are you sure to log out from account?'
          textCenter={true}
          close={handleToggleModal}
        >
          <ButtonWrapper>
            <Button variant='secondary' onClick={handleToggleModal}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleLogOut}>
              Yes, log out
            </Button>
          </ButtonWrapper>
        </Modal>
      )}
    </>
  );
};
