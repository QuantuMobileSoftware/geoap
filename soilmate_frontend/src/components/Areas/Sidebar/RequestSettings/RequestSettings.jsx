import React from 'react';
import { Select } from 'components/_shared/Select';

export const RequestSettings = ({ areas }) => {
  return (
    <>
      <Select
        items={areas.map(({ name }) => ({ name, value: name }))}
        label='Choose area'
      />
    </>
  );
};
