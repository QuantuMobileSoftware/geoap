import styled, { css } from 'styled-components';
import { rem, em } from 'styles';
import { Link } from 'react-router-dom';

const MenuListItem = css`
  ${({ theme }) => css`
    font-size: ${rem(13)};
    color: ${theme.colors.nature.n5};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.primary.p1};
    }
  `}
`;

export const MenuItem = styled.li`
  ${MenuListItem}
  margin-right: ${em(24)};
`;

export const MenuLink = styled(Link)`
  ${MenuListItem}
  text-decoration: none;
`;

export const StyledMenu = styled.ul`
  display: flex;
  margin-right: auto;
`;
