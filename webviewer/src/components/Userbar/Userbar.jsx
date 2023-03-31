import React, { useRef, useState } from 'react';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { Modal } from 'components/_shared/Modal';
import { Form } from 'components/_shared/Form';
import { ROUTES } from '_constants';
import { useHistory } from 'react-router-dom';
import {
  StyledFormField,
  StyledUserbar,
  UserbarAvatar,
  UserbarMenu,
  UserbarName,
  ButtonWrapper
} from './Userbar.styles';

import { Button } from 'components/_shared/Button';

import { selectUser, useUserActions, useAreasActions } from 'state';
import { getStyledComponentClassName, getUserName } from 'utils';
import { TAB_HASH } from 'pages/Account/constants';

const validationSchema = Yup.object().shape({
  planet_api_key: Yup.string().max(64).label('API key')
});

export const Userbar = ({ ...props }) => {
  const history = useHistory();
  const menuRef = useRef(null);
  const user = useSelector(selectUser);
  const { logout, setApiKey, isLoading, toggleLogoutModal } = useUserActions();
  const { resetAreasState } = useAreasActions();
  const [isSettingsModalOpen, setIsSettingModalOpen] = useState(false);

  const hasDemoUser = process.env.REACT_APP_AUTOLOGIN === user.username;
  const apiKey = user.planet_api_key ? user.planet_api_key : '';

  const handleLogOut = () => {
    logout(true);
    resetAreasState();
  };

  const handleSendForm = async values => {
    await setApiKey(values);
    handleToggleSettingsModal();
  };

  const handleToggleSettingsModal = () => setIsSettingModalOpen(!isSettingsModalOpen);
  const handleSettings = () =>
    history.push({ pathname: ROUTES.ACCOUNT, hash: TAB_HASH.profile });

  return (
    <>
      {hasDemoUser ? (
        <Button variant='primary' onClick={handleLogOut}>
          Log in
        </Button>
      ) : (
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
            <Button icon='Settings' onClick={handleSettings}>
              Settings
            </Button>
            <Button icon='Link' onClick={handleToggleSettingsModal}>
              API Manager
            </Button>
            <Button icon='LogOut' onClick={toggleLogoutModal}>
              Log Out
            </Button>
          </UserbarMenu>
        </StyledUserbar>
      )}
      {user.isShowLogoutModal && (
        <Modal
          header='Are you sure to log out from account?'
          textCenter={true}
          close={toggleLogoutModal}
        >
          <ButtonWrapper>
            <Button variant='secondary' onClick={toggleLogoutModal}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleLogOut}>
              Yes, log out
            </Button>
          </ButtonWrapper>
        </Modal>
      )}
      {isSettingsModalOpen && (
        <Modal
          header='Planet API key'
          textCenter={true}
          close={handleToggleSettingsModal}
        >
          <Form
            isLoading={isLoading}
            initialValues={{
              planet_api_key: apiKey
            }}
            validationSchema={validationSchema}
            onSubmit={handleSendForm}
          >
            <StyledFormField
              type='password'
              name='planet_api_key'
              placeholder='API key'
            />
            <ButtonWrapper>
              <Button variant='primary' type='submit'>
                Save
              </Button>
              <Button variant='secondary' onClick={handleToggleSettingsModal}>
                Cancel
              </Button>
            </ButtonWrapper>
          </Form>
        </Modal>
      )}
    </>
  );
};
