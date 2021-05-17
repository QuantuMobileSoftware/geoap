import React from 'react';
import * as Yup from 'yup';

import { StyledAuthForm } from './AuthForm.styles';

import { FormField, FormFieldset } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';

const validationSchema = Yup.object().shape({
  username: Yup.string().required(),
  password: Yup.string().required()
});

export const AuthForm = ({ initialValues = {}, ...props }) => {
  const _initialValues = { username: '', password: '', ...initialValues };

  return (
    <StyledAuthForm
      {...props}
      initialValues={_initialValues}
      validationSchema={validationSchema}
      actions={[
        <Button key='submit' type='submit'>
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
          label='Passowrd'
          type='password'
          name='password'
          placeholder='Enter password'
        />
      </FormFieldset>
    </StyledAuthForm>
  );
};
