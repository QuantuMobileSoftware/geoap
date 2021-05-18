import styled, { css } from 'styled-components';

import { rem } from 'styles';
import { shouldForwardProp } from 'utils';

import { Button } from '../Button';
import { Dropdown } from '../Dropdown';

export const MenuListItem = styled.li``;

export const MenuList = styled.ul``;

export const MenuDropdown = styled(Dropdown)`
  max-width: ${rem(140)};
`;

export const MenuToggle = styled(Button)`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n3};
  `}
`;

export const StyledMenu = styled.div.withConfig({ shouldForwardProp })`
  position: relative;
  display: flex;
`;
