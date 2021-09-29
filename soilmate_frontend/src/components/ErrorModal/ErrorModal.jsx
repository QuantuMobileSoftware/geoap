import React, { useState, useEffect } from 'react';
import { Modal } from 'components/_shared/Modal';
import { Button } from 'components/_shared/Button';
import { useLocation } from 'react-router';

import { areasEvents } from '_events';
import { ROUTES, PERMISSION_ERROR, SERVER_ERROR } from '_constants';
import { ButtonWrapper } from './ErrorModal.styles';

export const ErrorModal = () => {
  const [error, setError] = useState(null);
  const [errorText, setErrorText] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === ROUTES.AUTH) {
      setError(null);
    }
  }, [location]);

  useEffect(() => {
    areasEvents.onToggleErrorModal(({ error }) => {
      if (error.config.method === 'get') {
        return;
      }
      setError(error);
      if (typeof error === 'string') {
        setErrorText(error);
      } else {
        if (error.status === 403) {
          setErrorText(PERMISSION_ERROR);
        } else if (error.status === 500) {
          setErrorText(SERVER_ERROR);
        } else {
          setErrorText(error.data?.name[0]);
        }
      }
    });
  }, [location]);

  const handleCloseModal = () => setError(null);

  return (
    error && (
      <Modal close={handleCloseModal} textCenter={true}>
        <div>{errorText}</div>
        <ButtonWrapper>
          <Button variant='secondary' onClick={handleCloseModal}>
            Close
          </Button>
        </ButtonWrapper>
      </Modal>
    )
  );
};
