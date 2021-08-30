import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

export const StyledBreadCrumbs = styled.div`
  ${({ theme }) => css`
    font-size: ${rem(11)};
    color: ${theme.colors.primary.p2};
    margin-bottom: ${em(20)};
  `}
`;

export const StyledTitle = styled.span`
  cursor: pointer;
`;

export const StyledDash = styled.span`
  user-select: none;
`;
