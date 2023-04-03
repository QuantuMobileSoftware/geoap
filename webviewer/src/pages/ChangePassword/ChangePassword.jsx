import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'state';
import { Page } from 'components/_shared/Page';
import { NewPassword } from 'components/NewPassword';
import { Wrapper } from './ChangePassword.styles';
import { Header } from 'components/Header';

export const ChangePassword = ({ ...props }) => {
  const user = useSelector(selectUser);

  return (
    <Page {...props} header={user.isAuthorized ? <Header /> : null}>
      <Wrapper padding={4}>
        <NewPassword />
      </Wrapper>
    </Page>
  );
};
