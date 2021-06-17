import styled, { css } from 'styled-components';

import { rem } from 'styles';

export const StyledAreasList = styled.ul`
  ${({ theme }) => css`
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
  `}
`;