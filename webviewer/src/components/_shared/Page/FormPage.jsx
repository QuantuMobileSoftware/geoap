import React from 'react';

import { StyledFormPage } from './FormPage.styles';

export const FormPage = ({ children, ...props }) => {
  return <StyledFormPage {...props}>{children}</StyledFormPage>;
};
