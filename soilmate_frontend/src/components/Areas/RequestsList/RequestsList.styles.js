import styled, { css } from 'styled-components';

import { rem, sidebarListStyle } from 'styles';

export const RequestsList = styled.ul`
  ${({ theme }) => css`
    ${sidebarListStyle}
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
  `}
`;
