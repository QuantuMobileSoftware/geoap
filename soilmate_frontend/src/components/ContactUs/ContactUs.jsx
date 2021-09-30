import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { send } from 'emailjs-com';

import { Modal } from 'components/_shared/Modal';
import { Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';

import { areasEvents } from '_events';
import { StyledFormField, StyledButton } from './ContactUs.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  message: Yup.string().required()
});

const MESSAGE_ERROR = 'Failed to send your message, please try again later';
const MESSAGE_SUCCESS = 'Your message has been successfully sent';
const FORM_TITLE =
  'Please leave your Name, email address and a message in the fields below:';
const {
  REACT_APP_EMAILJS_SERVICE_ID,
  REACT_APP_EMAILJS_TEMPLATE_ID,
  REACT_APP_EMAILJS_USER_ID
} = process.env;

export const ContactUs = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState(FORM_TITLE);
  const [isDisabledSend, setIsDisabledSend] = useState(false);

  useEffect(() => {
    return areasEvents.onToggleContactUs(isOpen => setIsFormOpen(isOpen));
  }, []);

  const handleSendForm = values => {
    setIsDisabledSend(true);
    send(
      REACT_APP_EMAILJS_SERVICE_ID,
      REACT_APP_EMAILJS_TEMPLATE_ID,
      values,
      REACT_APP_EMAILJS_USER_ID
    )
      .then(
        () => {
          setModalTitle(MESSAGE_SUCCESS);
        },
        () => {
          setModalTitle(MESSAGE_ERROR);
        }
      )
      .then(() => {
        setIsModalOpen(true);
        setIsDisabledSend(false);
      });
  };

  const handleCloseContactUs = () => {
    setIsFormOpen(false);
    setIsModalOpen(false);
  };

  if (!isFormOpen) return null;

  return (
    <>
      <Modal header={modalTitle} close={handleCloseContactUs} textCenter={isModalOpen}>
        {isModalOpen ? (
          <Button variant='primary' onClick={handleCloseContactUs}>
            Cancel
          </Button>
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
                <StyledButton type='submit' variant='primary' disabled={isDisabledSend}>
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
