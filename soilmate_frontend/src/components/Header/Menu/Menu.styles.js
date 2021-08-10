import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

export const MenuItem = styled.li`
  ${({ theme }) => css`
    margin-right: ${em(24)};
    font-size: ${rem(13)};
    color: ${theme.colors.nature.n5};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.primary.p1};
    }
  `}
`;

export const StyledMenu = styled.ul`
  display: flex;
  margin-right: auto;
`;
