import styled, { css } from 'styled-components';
import { em } from 'styles';

export const StyledBreadcrumbs = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    font-size: ${em(12)};
    color: ${theme.colors.primary.p2};
  `}
`;

export const BreadcrumbsItem = styled.div`
  &:last-child {
    cursor: default;
  }
`;

export const Separator = styled.span`
  margin: 0 ${em(4)};
`;
