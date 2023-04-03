import React from 'react';
import * as Yup from 'yup';
import { useUserActions } from 'state';
import { FormField, FormFieldset } from 'components/_shared/Form';
import { Link } from 'components/_shared/Link';
import { Button } from 'components/_shared/Button';
import { FIELD_VALIDATION, ROUTES } from '_constants';
import { StyledForm, FormText } from './Form.styles';

const validationSchema = Yup.object().shape({
  email: Yup.string().email().required(FIELD_VALIDATION.REQUIRED)
});

export const EmailForm = ({ setEmail }) => {
  const { forgotPassword, isLoading, error } = useUserActions();

  const handleSubmit = async value => {
    await forgotPassword(value);
    setEmail(value.email);
  };

  return (
    <StyledForm
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      initialValues={{ email: '' }}
      header='Forgot password?'
      message={
        <div>
          Remembered password? <Link to={ROUTES.AUTH}>Login</Link>
        </div>
      }
      error={error}
      actions={[
        <Button
          key='submit'
          type='submit'
          variant='primary'
          disabled={isLoading}
          fullWidth
        >
          Send code
        </Button>
      ]}
    >
      <FormFieldset>
        <FormText>
          Don’t worry! It happens. Please enter the email associated with your account.
        </FormText>
        <FormField label='Email' name='email' placeholder='Enter your email address' />
      </FormFieldset>
    </StyledForm>
  );
};
