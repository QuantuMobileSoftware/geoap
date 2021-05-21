import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Sidebar } from 'components/_shared/Sidebar';
import { StyledSearch } from 'components/_shared/Search';

export const StyledAreasSidebar = styled(Sidebar)`
  ${({ theme }) => css`
    ${StyledSearch} {
      margin-top: ${rem(theme.spacing[11])};
    }
  `}
`;
