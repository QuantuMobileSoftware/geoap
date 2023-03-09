import React, { useState } from 'react';
import { Page } from 'components/_shared/Page';
import { ContactUs } from 'components/ContactUs';
import { Sidebar } from './components';
import { Wrapper } from './Account.styles';
import { PageContent } from './components';
const TABS = [
  { name: 'Profile', icon: 'Settings' },
  { name: 'Transactions', icon: 'Document' }
];

export const Account = ({ ...props }) => {
  const [activeTab, setActiveTab] = useState(TABS[0].name);

  return (
    <Page {...props}>
      <Wrapper>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
        <PageContent activeTab={activeTab} tabs={TABS} />
      </Wrapper>
      <ContactUs />
    </Page>
  );
};
