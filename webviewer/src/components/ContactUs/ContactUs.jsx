import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useEmail } from 'hooks';
import { Modal } from 'components/_shared/Modal';
import { Form } from 'components/_shared/Form';
import { EMAIL_TEXT } from '_constants';
import { areasEvents } from '_events';
import { StyledFormField, StyledButton } from './ContactUs.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required().max(100),
  email: Yup.string().email().required().max(100),
  message: Yup.string().trim().required().max(500)
});

const FORM_TITLE =
  'Please leave your Name, email address and a message in the fields below:';

export const ContactUs = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isShowMessage, setIsShowMessage] = useState(false);
  const [modalTitle, setModalTitle] = useState(FORM_TITLE);
  const { isLoading, sendEmail } = useEmail();

  useEffect(() => {
    return areasEvents.onToggleContactUs(isOpen => setIsFormOpen(isOpen));
  }, []);

  const handleSendForm = async values => {
    const isSent = await sendEmail(values);
    setModalTitle(isSent ? EMAIL_TEXT.success : EMAIL_TEXT.error);
    setIsShowMessage(true);
  };

  const handleCloseContactUs = () => {
    setIsFormOpen(false);
    setIsShowMessage(false);
    setModalTitle(FORM_TITLE);
  };

  if (!isFormOpen) return null;

  return (
    <>
      <Modal header={modalTitle} close={handleCloseContactUs} textCenter={isShowMessage}>
        {isShowMessage ? (
          <StyledButton variant='primary' onClick={handleCloseContactUs}>
            Ok
          </StyledButton>
        ) : (
          <Form
            initialValues={{
              name: '',
              email: '',
              message: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSendForm}
          >
            {() => (
              <>
                <StyledFormField autoFocus label='Name' name='name' placeholder='Name' />
                <StyledFormField
                  label='Email'
                  name='email'
                  placeholder='Email'
                  type='email'
                />
                <StyledFormField
                  label='Message'
                  name='message'
                  placeholder='Message'
                  type='textArea'
                />
                <StyledButton type='submit' variant='primary' disabled={isLoading}>
                  Send
                </StyledButton>
              </>
            )}
          </Form>
        )}
      </Modal>
    </>
  );
};
