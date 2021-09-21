import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { Modal } from 'components/_shared/Modal';
import { Form } from 'components/_shared/Form';

import { areasEvents } from '_events';
import { StyledFormField, StyledButton } from './ContactUs.styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  message: Yup.string().required()
});

export const ContactUs = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  useEffect(() => {
    return areasEvents.onToggleContactUs(isOpen => setIsOpenModal(isOpen));
  }, []);

  const handleSendForm = values => {
    console.log(values); // send data to server
    setIsOpenModal(false);
  };

  const handleCloseContactUs = () => setIsOpenModal(false);

  if (!isOpenModal) return null;

  return (
    <Modal
      header='Please leave your Name, email address and a message in the fields below:'
      close={handleCloseContactUs}
    >
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
            <StyledButton type='submit' variant='primary'>
              Send
            </StyledButton>
          </>
        )}
      </Form>
    </Modal>
  );
};
