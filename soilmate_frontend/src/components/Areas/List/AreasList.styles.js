import styled, { css } from 'styled-components';

import { rem, sidebarListStyle } from 'styles';

export const AreasList = styled.ul`
  ${({ theme, items }) => css`
    ${sidebarListStyle}
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
    overflow-y: ${items > 1 ? 'auto' : 'visible'};
  `}
`;
