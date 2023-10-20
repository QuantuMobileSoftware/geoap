import React, { useState } from 'react';

import { useUserActions } from 'state';
import { FormField, FormFieldset, Form } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { Link } from 'components/_shared/Link';
import { Checkbox } from 'components/_shared/Checkbox';
import { ROUTES } from '_constants';
import { validationSchema, _initialValues } from './formValues';

import {
  StyledMessage,
  FormWrapper,
  FormFooter,
  TermsOfService,
  CheckboxWrapper,
  CheckboxLabel
} from './SignUp.styles';

const formButton = (
  <Button key='submit' type='submit' variant='primary' fullWidth>
    Sign up
  </Button>
);

export const SignUpForm = ({ initialValues = {}, setEmail, ...props }) => {
  const { isLoading, error, registerUser } = useUserActions();
  const [isChecked, setIsChecked] = useState(true);

  const onSubmit = async values => {
    await registerUser({ ...values, receive_news: isChecked });
    setEmail(values.email);
  };

  return (
    <FormWrapper>
      <Form
        {...props}
        initialValues={{ ..._initialValues, ...initialValues }}
        validationSchema={validationSchema}
        header='Sign up'
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
      </Form>
      <FormFooter>
        <TermsOfService>
          By clicking on Sing up, you agree to{' '}
          <Link to={ROUTES.TERMS}>Terms of Service</Link> and{' '}
          <Link to={ROUTES.POLICY}>Privacy Policy</Link>
        </TermsOfService>
        <CheckboxWrapper onClick={() => setIsChecked(!isChecked)}>
          <Checkbox checked={isChecked} />
          <CheckboxLabel>I agree to receive newsletters</CheckboxLabel>
        </CheckboxWrapper>
        <StyledMessage>Already have an account? </StyledMessage>
        <Link to={ROUTES.AUTH}>Login</Link>
      </FormFooter>
    </FormWrapper>
  );
};
