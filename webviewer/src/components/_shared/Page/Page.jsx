import React from 'react';

import { PageHeader, StyledPage } from './Page.styles';

import { Header } from 'components/Header';

export const Page = ({ children, header = <Header />, ...props }) => {
  return (
    <StyledPage {...props}>
      {header && <PageHeader>{header}</PageHeader>}
      {children}
    </StyledPage>
  );
};
