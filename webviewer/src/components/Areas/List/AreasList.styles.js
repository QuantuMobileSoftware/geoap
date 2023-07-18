import styled, { css } from 'styled-components';

import { rem, sidebarList } from 'styles';

export const AreasList = styled.ul`
  ${({ theme, areasAmount }) => css`
    ${sidebarList}
    max-height: calc(100vh - 300px);
    margin: 0 -${rem(theme.spacing[6])};
    margin-top: ${rem(theme.spacing[2])};
    overflow-y: ${areasAmount > 2 ? 'auto' : 'visible'};
  `}
`;
