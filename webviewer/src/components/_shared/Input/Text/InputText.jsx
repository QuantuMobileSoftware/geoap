import React from 'react';

import { StyledInputText } from './InputText.styles';

export const InputText = ({ type = 'text', ...props }) => {
  return <StyledInputText {...props} type={type} />;
};
