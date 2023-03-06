import React from 'react';

import { PageBody } from './Page.styles';
import { StyledFormPage } from './FormPage.styles';

export const FormPage = ({ children, ...props }) => {
  return (
    <StyledFormPage {...props}>
      {children && <PageBody>{children}</PageBody>}
    </StyledFormPage>
  );
};
