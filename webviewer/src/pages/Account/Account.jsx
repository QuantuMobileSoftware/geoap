import React, { useState } from 'react';
import { Page } from 'components/_shared/Page';
import { ContactUs } from 'components/ContactUs';
import { Sidebar } from './components';
import { Wrapper } from './Account.styles';
import { PageContent } from './components';
import { TAB_NAMES } from './constants';

export const Account = ({ ...props }) => {
  const [activeTab, setActiveTab] = useState(TAB_NAMES.profile);

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
