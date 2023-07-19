import React from 'react';

import { PageHeader, StyledPage } from './Page.styles';

import { Header } from 'components/Header';
import { RemoteServerNotification } from 'components/RemoteServerNotification';

export const Page = ({ children, header = <Header />, ...props }) => {
  return (
    <StyledPage {...props}>
      <RemoteServerNotification />
      {header && <PageHeader>{header}</PageHeader>}
      {children}
    </StyledPage>
  );
};
