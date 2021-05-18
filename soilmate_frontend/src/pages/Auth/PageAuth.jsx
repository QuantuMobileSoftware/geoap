import React from 'react';

import { StyledPageAuth } from './PageAuth.styles';

import { AuthForm } from 'components/Auth';
import { Logo } from 'components/Logo';
import { Paper } from 'components/_shared/Paper';

import { useUserActions } from 'state';

export const PageAuth = ({ ...props }) => {
  const { isLoading, error, login } = useUserActions();

  const handleSubmit = values => login(values);

  return (
    <StyledPageAuth {...props} header={false}>
      <Paper padding={4}>
        <Logo />
        <AuthForm isLoading={isLoading} error={error} onSubmit={handleSubmit} />
      </Paper>
    </StyledPageAuth>
  );
};
