import React from 'react';

import { StyledPageAuth } from './PageAuth.styles';

import { AuthForm } from 'components/Auth';
import { Logo } from 'components/Logo';
import { Paper } from 'components/_shared/Paper';

export const PageAuth = ({ ...props }) => {
  return (
    <StyledPageAuth {...props} header={false}>
      <Paper padding={4}>
        <Logo />
        <AuthForm />
      </Paper>
    </StyledPageAuth>
  );
};
