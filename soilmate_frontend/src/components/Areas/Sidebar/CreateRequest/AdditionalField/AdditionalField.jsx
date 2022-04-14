import React from 'react';
import { StyledInput, InputWrapper } from './AdditionalField.styles';
import { Label } from 'components/_shared/Select';
import { isNil } from 'lodash-es';

export const AdditionalField = ({ value, onChange }) => {
  if (isNil(value)) return null;
  return (
    <InputWrapper>
      <Label>Additionally</Label>
      <StyledInput value={value} onChange={onChange} />
    </InputWrapper>
  );
};
