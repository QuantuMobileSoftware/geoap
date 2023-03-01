import React from 'react';
import { useUserActions } from 'state';
import { FormField, FormFieldset } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { ROUTES } from '_constants';
import { validationSchema, _initialValues } from './formValues';
import { StyledLink, StyledMessage, StyledForm } from './SignUp.styles';

const formMessage = (
  <>
    <StyledMessage>Already have an account? </StyledMessage>
    <StyledLink to={ROUTES.AUTH}>Login</StyledLink>
  </>
);
const formButton = (
  <Button key='submit' type='submit' variant='primary' fullWidth>
    Sign up
  </Button>
);

export const SignUpForm = ({ initialValues = {}, setEmail, ...props }) => {
  const { isLoading, error, registerUser } = useUserActions();

  const onSubmit = async values => {
    await registerUser(values);
    setEmail(values.email);
  };

  return (
    <StyledForm
      {...props}
      initialValues={{ ..._initialValues, ...initialValues }}
      validationSchema={validationSchema}
      header='Sign up'
      message={formMessage}
      onSubmit={onSubmit}
      error={error}
      isLoading={isLoading}
      actions={[formButton]}
    >
      <FormFieldset>
        <FormField
          label='Username'
          type='text'
          name='username'
          placeholder='enter username'
        />
        <FormField
          label='Email'
          type='text'
          name='email'
          placeholder='example@gmail.com'
        />
        <FormField
          label='Create password'
          type='password'
          name='password1'
          placeholder='at least 8 characters'
        />
        <FormField
          label='Confirm password'
          type='password'
          name='password2'
          placeholder='repeat password'
        />
      </FormFieldset>
    </StyledForm>
  );
};