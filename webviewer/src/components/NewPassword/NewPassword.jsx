import React, { useState } from 'react';
import * as Yup from 'yup';
import { FIELD_VALIDATION } from '_constants';
import { useUserActions } from 'state';
import { FormField, FormFieldset } from 'components/_shared/Form';
import { Button } from 'components/_shared/Button';
import { StyledForm } from './NewPassword.styles';
import { ConfirmCard } from './ConfirmCart';

const validationSchema = Yup.object().shape({
  new_password1: Yup.string()
    .trim()
    .min(8, FIELD_VALIDATION.PASSWORD)
    .required(FIELD_VALIDATION.REQUIRED),
  new_password2: Yup.string()
    .trim()
    .min(8, FIELD_VALIDATION.PASSWORD)
    .required(FIELD_VALIDATION.REQUIRED)
    .oneOf([Yup.ref('new_password1'), null], FIELD_VALIDATION.PASSWORD_MATCH)
});

const _initialValues = {
  new_password1: '',
  new_password2: ''
};

export const NewPassword = () => {
  const { isLoading, changePassword, error } = useUserActions();
  const [isShowNotice, setIsShowNotice] = useState(false);

  const onSubmit = async values => {
    const resp = await changePassword(values);
    if (resp.statusText === 'OK') setIsShowNotice(true);
  };

  if (isShowNotice) return <ConfirmCard />;

  return (
    <StyledForm
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      initialValues={_initialValues}
      header='Reset password'
      error={error}
      actions={[
        <Button
          key='submit'
          type='submit'
          variant='primary'
          disabled={isLoading}
          fullWidth
        >
          Reset password
        </Button>
      ]}
    >
      <FormFieldset>
        <FormField
          label='New password'
          type='password'
          name='new_password1'
          placeholder='at least 8 characters'
        />
        <FormField
          label='Confirm new password'
          type='password'
          name='new_password2'
          placeholder='repeat password'
        />
      </FormFieldset>
    </StyledForm>
  );
};
