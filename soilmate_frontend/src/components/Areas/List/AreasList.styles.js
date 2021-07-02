import styled, { css } from 'styled-components';

import { rem } from 'styles';

export const AreasList = styled.ul`
  ${({ theme, isEmpty }) => css`
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
    max-height: 80%;
    min-height: ${isEmpty ? 0 : 150}px;
    overflow-y: auto;
  `}
`;
