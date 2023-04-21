import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useEmail } from 'hooks';
import { selectUser } from 'state';
import { Modal } from 'components/_shared/Modal';
import { TextArea } from 'components/_shared/Input';
import { Button } from 'components/_shared/Button';
import { ButtonWrapper } from './Profile.styles';
import { EMAIL_TEXT, EMAIL_VARIABLES } from '_constants';

export const ProfileModal = ({ toggleModal }) => {
  const user = useSelector(selectUser);
  const { isLoading, sendEmail } = useEmail();
  const [userMessage, setUserMessage] = useState('I want to remove my account...');
  const [notice, setNotice] = useState(null);

  const handleSend = async () => {
    const isSent = await sendEmail({
      [EMAIL_VARIABLES.message]: userMessage,
      [EMAIL_VARIABLES.id]: user.pk,
      [EMAIL_VARIABLES.email]: user.email
    });
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
