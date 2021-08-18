import styled, { css } from 'styled-components';

import { rem } from 'styles';

export const RequestsList = styled.ul`
  ${({ theme, isEmpty }) => css`
    margin: 0 -${rem(theme.spacing[8])};
    margin-top: ${rem(theme.spacing[2])};
    max-height: 70%;
    min-height: ${isEmpty ? 0 : rem(150)};
    overflow-y: auto;
  `}
`;
