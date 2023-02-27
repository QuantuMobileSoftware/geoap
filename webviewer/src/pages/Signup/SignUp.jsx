import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUserActions } from 'state';
import { Paper } from 'components/_shared/Paper';
import { Spinner } from 'components/_shared/Spinner';
import { FormPage } from 'components/_shared/Page';
import { ConfirmCard, SignUpForm, VerifyCard } from './components';

export const SingUp = ({ ...props }) => {
  const params = useParams();
  const { isLoading, error, confirmRegistration } = useUserActions();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (params.id) {
      confirmRegistration(params.id);
    }
  }, [params.id, confirmRegistration]);

  if (isLoading) return <Spinner />;

  if (params.id)
    return (
      <FormPage {...props} header={false}>
        <Paper padding={4}>
          <ConfirmCard error={error} />
        </Paper>
      </FormPage>
    );

  return (
    <FormPage {...props} header={false}>
      <Paper padding={4}>
        {!email && <SignUpForm setEmail={setEmail} />}
        {email && <VerifyCard email={email} />}
      </Paper>
    </FormPage>
  );
};
