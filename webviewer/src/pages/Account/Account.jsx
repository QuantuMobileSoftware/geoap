import React, { useState } from 'react';
import { Page } from 'components/_shared/Page';
import { ContactUs } from 'components/ContactUs';
import { Sidebar } from './components';
import { Wrapper } from './Account.styles';
import { PageContent } from './components';
import { TAB_NAMES, TABS } from './constants';
import { useLocation } from 'react-router-dom';

export const Account = ({ ...props }) => {
  const { hash } = useLocation();
  const currentTab = TABS.find(tab => tab.hash === hash);
  const [activeTab, setActiveTab] = useState(currentTab?.name ?? TAB_NAMES.profile);

  return (
    <Page {...props}>
      <Wrapper>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <PageContent activeTab={activeTab} />
      </Wrapper>
      <ContactUs />
    </Page>
  );
};
