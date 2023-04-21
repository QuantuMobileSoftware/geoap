import React, { useState } from 'react';
import * as Yup from 'yup';
import { useEmail } from 'hooks';
import { useInterfaceActions } from 'state';
import { Modal } from 'components/_shared/Modal';
import { Form } from 'components/_shared/Form';
import { EMAIL_TEXT, EMAIL_VARIABLES } from '_constants';
import { StyledFormField, StyledButton } from './ContactUs.styles';

const { name, email, message } = EMAIL_VARIABLES;
const validationSchema = Yup.object().shape({
  [name]: Yup.string().trim().required().max(100),
  [email]: Yup.string().email().required().max(100),
  [message]: Yup.string().trim().required().max(500)
});

const FORM_TITLE =
  'Please leave your Name, email address and a message in the fields below:';

export const ContactUs = () => {
  const { setOpenContactUs } = useInterfaceActions();
  const [isShowMessage, setIsShowMessage] = useState(false);
  const [modalTitle, setModalTitle] = useState(FORM_TITLE);
  const { isLoading, sendEmail } = useEmail();

  const handleSendForm = async values => {
    const isSent = await sendEmail(values);
    setModalTitle(isSent ? EMAIL_TEXT.success : EMAIL_TEXT.error);
    setIsShowMessage(true);
  };

  const handleCloseContactUs = () => {
    setOpenContactUs(false);
  };

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
              [name]: '',
              [email]: '',
              [message]: ''
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
