import React from 'react';
import * as Yup from 'yup';

import { Button } from 'components/_shared/Button';
import { FormField, FormFieldset, Form } from 'components/_shared/Form';
import { Link } from 'components/_shared/Link';
import { ROUTES, FIELD_VALIDATION } from '_constants';
import { StyledMessage, ForgotPassLinkWrap } from './AuthForm.styles';

const validationSchema = Yup.object().shape({
  username: Yup.string().trim().required(FIELD_VALIDATION.REQUIRED),
  password: Yup.string().trim().required(FIELD_VALIDATION.REQUIRED)
});

export const AuthForm = ({ initialValues = {}, ...props }) => {
  const _initialValues = { username: '', password: '', ...initialValues };
  const formMessage = (
    <>
      <StyledMessage>Don’t have an account? </StyledMessage>
      <Link to={ROUTES.SIGN_UP}>Sign up</Link>
    </>
  );

  return (
    <Form
      {...props}
      initialValues={_initialValues}
      validationSchema={validationSchema}
      header='Login'
      message={formMessage}
      actions={[
        <Button key='submit' type='submit' variant='primary' fullWidth>
          Login
        </Button>
      ]}
    >
      <FormFieldset>
        <FormField
          label='Username'
          type='text'
          name='username'
          placeholder='Enter username'
        />
        <FormField
          label='Password'
          type='password'
          name='password'
          placeholder='Enter password'
        />
        <ForgotPassLinkWrap>
          <Link to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
        </ForgotPassLinkWrap>
      </FormFieldset>
    </Form>
  );
};
