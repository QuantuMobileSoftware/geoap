import React from 'react';
import { StyledInput, InputWrapper } from './AdditionalField.styles';
import { Label } from 'components/_shared/Select';
import { isNil } from 'lodash-es';

export const AdditionalField = ({ label, value, onChange }) => {
  if (isNil(label)) return null;
  return (
    <InputWrapper>
      <Label>{label}</Label>
      <StyledInput value={value} onChange={onChange} />
    </InputWrapper>
  );
};
