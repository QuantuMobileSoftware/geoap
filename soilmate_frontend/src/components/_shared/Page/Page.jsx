import React from 'react';

import { PageHeader, PageBody, StyledPage } from './Page.styles';

import { Header } from 'components/Header';

export const Page = ({ children, header = <Header />, ...props }) => {
  return (
    <StyledPage {...props}>
      {header && <PageHeader>{header}</PageHeader>}
      {children && <PageBody>{children}</PageBody>}
    </StyledPage>
  );
};
