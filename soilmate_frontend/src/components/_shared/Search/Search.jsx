import React from 'react';

import { StyledSearch } from './Search.styles';

import { FormField } from '../Form';
import { Button } from '../Button';

export const Search = ({ initialValues, control = {}, ...props }) => {
  const _initialValues = { query: '', ...initialValues };

  return (
    <StyledSearch {...props} initialValues={_initialValues}>
      <FormField {...control} type='text' name='query' />
      <Button type='submit' icon='Search' />
    </StyledSearch>
  );
};
