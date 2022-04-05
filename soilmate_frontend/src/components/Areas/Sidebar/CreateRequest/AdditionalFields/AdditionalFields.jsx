import React from 'react';
import { StyledInput, InputWrapper } from './AdditionalFields.styles';
import { Label } from 'components/_shared/Select';
import { upperFirst } from 'lodash-es';

export const AdditionalFields = ({ fields, onChange }) => {
  if (fields)
    return (
      <>
        {Object.entries(fields).map(([k, v]) => (
          <InputWrapper key={k}>
            <Label>{upperFirst(k)}</Label>
            <StyledInput placeholder={k} value={v} onChange={onChange} name={k} />
          </InputWrapper>
        ))}
      </>
    );

  return null;
};
