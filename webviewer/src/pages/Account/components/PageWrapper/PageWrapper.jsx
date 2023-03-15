import React from 'react';
import { Header, Wrapper } from './PageWrapper.styles';

export const PageWrapper = ({ children, header }) => {
  return (
    <Wrapper>
      {header && <Header>{header}</Header>}
      {children}
    </Wrapper>
  );
};
