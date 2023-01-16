import React from 'react';

import { StyledHeaderSearch } from './HeaderSearch.styles';

import { Icon } from 'components/_shared/Icon';

export const HeaderSearch = ({ ...props }) => {
  return (
    <StyledHeaderSearch {...props}>
      <Icon>Search</Icon>
    </StyledHeaderSearch>
  );
};
