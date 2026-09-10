import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from 'state';
import { AccountClock } from 'components/_shared/AccountClock';
import { getUserName } from 'utils';
import { Container, TitleGroup, PageTitle, AccountName } from './AccountHeader.styles';

export const AccountHeader = () => {
  const user = useSelector(selectUser);

  return (
    <Container>
      <TitleGroup>
        <PageTitle>Edge units</PageTitle>
        <AccountName>{getUserName(user)}</AccountName>
      </TitleGroup>
      <AccountClock />
    </Container>
  );
};
