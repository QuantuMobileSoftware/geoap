import React, { useState } from 'react';
import { useEmail } from 'hooks';
import { Modal } from 'components/_shared/Modal';
import { TextArea } from 'components/_shared/Input';
import { Button } from 'components/_shared/Button';
import { ButtonWrapper } from './Profile.styles';
import { EMAIL_TEXT } from '_constants';

export const ProfileModal = ({ toggleModal }) => {
  const { isLoading, sendEmail } = useEmail();
  const [userMessage, setUserMessage] = useState('I want to remove my account...');
  const [notice, setNotice] = useState(null);

  const handleSend = async () => {
    const isSent = await sendEmail({ message: userMessage });
    setNotice(isSent ? EMAIL_TEXT.success : EMAIL_TEXT.error);
  };

  return (
    <Modal header='Delete account' textCenter={true} close={toggleModal}>
      {notice && <h3>{notice}</h3>}
      {!notice && (
        <TextArea value={userMessage} onChange={e => setUserMessage(e.target.value)} />
      )}
      <ButtonWrapper>
        <Button variant='secondary' onClick={toggleModal}>
          Close
        </Button>
        {!notice && (
          <Button variant='primary' onClick={handleSend} disabled={isLoading}>
            Send
          </Button>
        )}
      </ButtonWrapper>
    </Modal>
  );
};
