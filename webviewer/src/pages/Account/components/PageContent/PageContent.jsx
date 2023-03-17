import React from 'react';
import { Profile } from '../Profile';
import { PageWrapper } from '../PageWrapper';
import { TAB_NAMES } from '../../constants';

export const PageContent = ({ activeTab }) => {
  switch (activeTab) {
    case TAB_NAMES.profile:
      return (
        <PageWrapper header='Your information'>
          <Profile />
        </PageWrapper>
      );
    // TODO: add in next PR with transaction tab
    // case TAB_NAMES.transactions:
    //   return (
    //     <PageWrapper header='Your transactions'>
    //       <h2>Transactions</h2>
    //     </PageWrapper>
    //   );
    default:
      return null;
  }
};
