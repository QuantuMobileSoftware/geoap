import styled, { css } from 'styled-components';

import { rem, sidebarList } from 'styles';

export const AreasList = styled.ul`
  ${({ theme, items }) => css`
    ${sidebarList}
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
    overflow-y: ${items > 1 ? 'auto' : 'visible'};
  `}
`;
