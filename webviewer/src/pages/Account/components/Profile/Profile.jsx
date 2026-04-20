import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { selectUser, useUserActions, useInterfaceActions } from 'state';
import { ROUTES } from '_constants';
import { ProfileModal } from './ProfileModal';
import { Button } from 'components/_shared/Button';
import {
  InfoItem,
  InfoTitle,
  InfoValue,
  Title,
  StyledButton,
  UserMessage
} from './Profile.styles';

const { REACT_APP_IS_GEOAP_EE_ENABLED } = process.env;

export const Profile = () => {
  const user = useSelector(selectUser);
  const history = useHistory();
  const { toggleLogoutModal, updateUser } = useUserActions();
  const { setOpenContactUs } = useInterfaceActions();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggleModal = () => setIsOpenModal(!isOpenModal);
  const handleChangePassword = () => {
    history.push(ROUTES.RESET_PASSWORD);
  };
  const handleTopUp = () => {
    setOpenContactUs(true);
    if (user.trial_finished_at && !user.is_trial_end_notified)
      updateUser({ is_trial_end_notified: true });
  };

  return (
    <div>
      <InfoItem>
        <InfoTitle>Email address:</InfoTitle>
        <InfoValue>{user.email}</InfoValue>
      </InfoItem>
      {REACT_APP_IS_GEOAP_EE_ENABLED === 'true' && (
        <>
          {user.trial_finished_at ? (
            <>
              <InfoItem>
                <InfoTitle>Your balance:</InfoTitle>
                <InfoValue large>${user.balance}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoTitle>Personal discount:</InfoTitle>
                <InfoValue large>{user.discount}%</InfoValue>
              </InfoItem>
              {!user.is_trial_end_notified && (
                <UserMessage>
                  The trial period is finished. Please top up your balance.
                </UserMessage>
              )}
            </>
          ) : (
            <UserMessage>
              To end the trial period and unlock all features, please top up your account.
            </UserMessage>
          )}
          <Button icon='Plus' variant='primary' onClick={handleTopUp}>
            Top-up account
          </Button>
        </>
      )}
      <Title>Administration</Title>
      <StyledButton icon='Eye' onClick={handleChangePassword}>
        Change password
      </StyledButton>
      <StyledButton icon='LogOut' onClick={toggleLogoutModal}>
        Log Out
      </StyledButton>
      <StyledButton variantType='danger' icon='Delete' onClick={toggleModal}>
        Delete account
      </StyledButton>
      {isOpenModal && <ProfileModal toggleModal={toggleModal} />}
    </div>
  );
};
