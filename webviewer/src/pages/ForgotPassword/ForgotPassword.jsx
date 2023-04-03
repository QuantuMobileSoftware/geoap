import React, { useState } from 'react';
import { useUserActions } from 'state';
import { FormPage } from 'components/_shared/Page';
import { Paper } from 'components/_shared/Paper';
import { EmailForm } from './components';
import { VerifyCard } from 'components/VerifyCard';

export const ForgotPassword = ({ ...props }) => {
  const { forgotPassword } = useUserActions();
  const [email, setEmail] = useState();

  const handleResend = () => forgotPassword({ email });

  return (
    <FormPage {...props} header={false}>
      <Paper padding={4}>
        {email ? (
          <VerifyCard email={email} onResend={handleResend} />
        ) : (
          <EmailForm setEmail={setEmail} />
        )}
      </Paper>
    </FormPage>
  );
};
