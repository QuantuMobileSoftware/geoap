import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, useUserActions } from 'state';
import { InfoItem, InfoTitle, InfoValue, Title, StyledButton } from './Profile.styles';
import { ProfileModal } from './ProfileModal';

export const Profile = () => {
  const user = useSelector(selectUser);
  const { toggleLogoutModal } = useUserActions();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggleModal = () => setIsOpenModal(!isOpenModal);

  return (
    <div>
      <InfoItem>
        <InfoTitle>Email address:</InfoTitle>
        <InfoValue>{user.email}</InfoValue>
      </InfoItem>
      <InfoItem>
        <InfoTitle>Your balance:</InfoTitle>
        <InfoValue large>${user.balance}</InfoValue>
      </InfoItem>
      <InfoItem>
        <InfoTitle>Personal discount:</InfoTitle>
        <InfoValue large>{user.discount}%</InfoValue>
      </InfoItem>
      <Title>Administration</Title>
      {/* TODO: add in change password task */}
      {/* <StyledButton icon='Eye'>Change password</StyledButton> */}
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
