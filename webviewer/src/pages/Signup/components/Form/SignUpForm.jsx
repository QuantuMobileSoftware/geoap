import React from 'react';
import { useUserActions } from 'state';
import { FormField, FormFieldset } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { Link } from 'components/_shared/Link';
import { ROUTES } from '_constants';
import { validationSchema, _initialValues } from './formValues';
import { StyledMessage, StyledForm, TermsOfService } from './SignUp.styles';

const formMessage = (
  <>
    <TermsOfService>
      By clicking on Sing up, you agree to <Link to={ROUTES.TERMS}>Terms of Service</Link>{' '}
      and <Link to={ROUTES.POLICY}>Privacy Policy</Link>
    </TermsOfService>
    <StyledMessage>Already have an account? </StyledMessage>
    <Link to={ROUTES.AUTH}>Login</Link>
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
