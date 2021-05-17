import React, { Children } from 'react';

import { StyledFormFieldset, FormFieldsetItem } from './FormFieldset.styles';

export const FormFieldset = ({ children, direction = 'column', ...props }) => {
  return (
    <StyledFormFieldset {...props} direction={direction}>
      {Children.map(children, child => {
        return child ? <FormFieldsetItem>{child}</FormFieldsetItem> : null;
      })}
    </StyledFormFieldset>
  );
};
