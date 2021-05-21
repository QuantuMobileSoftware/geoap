import React from 'react';

import { SearchButtonReset, SearchButtonSubmit, StyledSearch } from './Search.styles';

import { FormField } from '../Form';

export const Search = ({ initialValues, control = {}, onReset, ...props }) => {
  const _initialValues = { query: '', ...initialValues };

  return (
    <StyledSearch {...props} initialValues={_initialValues}>
      {form => (
        <>
          <FormField {...control} type='text' name='query' />
          <SearchButtonSubmit type='submit' icon='Search' />
          {form.values.query && (
            <SearchButtonReset
              type='button'
              icon='Cross'
              onClick={() => {
                form.resetForm();
                onReset?.();
              }}
            />
          )}
        </>
      )}
    </StyledSearch>
  );
};
