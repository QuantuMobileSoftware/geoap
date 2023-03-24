import React from 'react';
import { Page } from 'components/_shared/Page';
import { NewPassword } from 'components/NewPassword';
import { Wrapper } from './ChangePassword.styles';

export const ChangePassword = ({ ...props }) => {
  return (
    <Page {...props}>
      <Wrapper padding={4}>
        <NewPassword />
      </Wrapper>
    </Page>
  );
};
