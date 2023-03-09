import React from 'react';
import { Profile } from '../Profile';
import { PageWrapper } from '../PageWrapper';

export const PageContent = ({ activeTab, tabs }) => {
  switch (activeTab) {
    case tabs[0].name:
      return (
        <PageWrapper header='Your information'>
          <Profile />
        </PageWrapper>
      );
    case tabs[1].name:
      return (
        <PageWrapper header='Your transactions'>
          <h2>Transactions</h2>
        </PageWrapper>
      );
    default:
      return null;
  }
};
