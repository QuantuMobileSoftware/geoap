import React from 'react';
import { useInterfaceActions } from 'state';
import { Modal } from 'components/_shared/Modal';
import { Button } from 'components/_shared/Button';

import { Content, ButtonWrapper } from './InfoModal.styles';

export const InfoModal = ({ onClose, content }) => {
  const { setOpenContactUs } = useInterfaceActions();

  const handleSendRequest = () => {
    onClose();
    setOpenContactUs(true);
  };

  return (
    <Modal close={onClose}>
      <Content>{content}</Content>
      <ButtonWrapper>
        <Button variant='secondary' onClick={onClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleSendRequest}>
          Send request
        </Button>
      </ButtonWrapper>
    </Modal>
  );
};
