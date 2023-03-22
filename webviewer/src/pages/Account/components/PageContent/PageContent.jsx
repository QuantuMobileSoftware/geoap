import React from 'react';
import { Profile } from '../Profile';
import { PageWrapper } from '../PageWrapper';
import { TAB_NAMES } from '../../constants';
import { Transactions } from '../Transactions';

export const PageContent = ({ activeTab }) => {
  switch (activeTab) {
    case TAB_NAMES.profile:
      return (
        <PageWrapper header='Your information'>
          <Profile />
        </PageWrapper>
      );
    case TAB_NAMES.transactions:
      return (
        <PageWrapper header='Your transactions'>
          <Transactions />
        </PageWrapper>
      );
    default:
      return null;
  }
};
