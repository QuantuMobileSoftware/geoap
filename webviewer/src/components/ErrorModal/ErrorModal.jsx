import React, { useState, useEffect } from 'react';
import { Modal } from 'components/_shared/Modal';
import { Button } from 'components/_shared/Button';
import { useLocation } from 'react-router';

import { areasEvents } from '_events';
import {
  ROUTES,
  PERMISSION_ERROR,
  SERVER_ERROR,
  SIZE_ERROR,
  DEFAULT_ERROR,
  NOT_FOUND
} from '_constants';
import { ButtonWrapper } from './ErrorModal.styles';

const catchErrRoutes = [ROUTES.AUTH, ROUTES.SIGN_UP];

export const ErrorModal = () => {
  const [error, setError] = useState(null);
  const [errorText, setErrorText] = useState('');
  const location = useLocation();

  useEffect(() => {
    return areasEvents.onToggleErrorModal(({ error }) => {
      const isIgnoreError =
        catchErrRoutes.includes(location.pathname) && error.status === 400;

      if (error.config?.method === 'get' || isIgnoreError) {
        setError(null);
        return;
      }
      setError(error);
      if (typeof error === 'string') {
        setErrorText(error);
      } else {
        if (error.status === 403) {
          if (error.data.errorCode === 603) {
            setErrorText(SIZE_ERROR);
          } else {
            setErrorText(PERMISSION_ERROR);
          }
        } else if (error.status === 404) {
          setErrorText(NOT_FOUND);
        } else if (error.status >= 500) {
          setErrorText(SERVER_ERROR);
        } else {
          setErrorText(error.data?.name?.[0] || Object.values(error.data)?.[0][0]);
        }
      }
    });
  }, [location]);

  const handleCloseModal = () => setError(null);

  const handleOpenContactUs = () => {
    setError(null);
    areasEvents.toggleContactUs(true);
  };

  return (
    error && (
      <Modal close={handleCloseModal} textCenter={true}>
        <div>{errorText ?? DEFAULT_ERROR}</div>
        <ButtonWrapper>
          <Button variant='secondary' onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant='primary' onClick={handleOpenContactUs}>
            Send request
          </Button>
        </ButtonWrapper>
      </Modal>
    )
  );
};
