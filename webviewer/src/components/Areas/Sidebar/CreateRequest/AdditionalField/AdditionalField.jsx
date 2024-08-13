import React from 'react';
import { StyledInput, InputWrapper } from './AdditionalField.styles';
import { Label } from 'components/_shared/Select';
import { isNil } from 'lodash-es';

export const AdditionalField = ({ label, value, onChange, isHidden = false }) => {
  if (isNil(label)) return null;
  return (
    <InputWrapper isHidden={isHidden}>
      <Label>{label}</Label>
      <StyledInput value={value} onChange={onChange} />
    </InputWrapper>
  );
};
