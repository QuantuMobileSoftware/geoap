import styled, { css } from 'styled-components';

import { rem } from 'styles';

export const StyledBreadCrumbs = styled.div`
  ${({ theme }) => css`
    font-size: ${rem(11)};
    color: ${theme.colors.primary.p2};
  `}
`;

export const StyledTitle = styled.span`
  cursor: pointer;
`;

export const StyledDash = styled.span`
  user-select: none;
`;
