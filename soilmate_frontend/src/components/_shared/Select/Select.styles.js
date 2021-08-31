import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { Dropdown } from '../Dropdown';
import { Typography } from '../Typography';
import { Icon } from 'components/_shared/Icon';

export const SelectDropdown = styled(Dropdown)`
  min-width: 100%;
  top: ${rem(43)};
  left: 0;
  padding: 0;
`;

export const SelectToggle = styled.div`
  ${({ theme }) =>
    css`
      position: relative;
      border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
      padding: ${rem(9)} ${rem(10)} ${rem(7)};
      border-radius: ${em(theme.radius[0], theme.fontSizes[2])};
      cursor: pointer;
      &:hover {
        border-color: ${theme.colors.primary.p2};
        color: ${theme.colors.primary.p2};
      }
    `}
`;

export const SelectToggleText = styled.div`
  padding-right: ${rem(18)};
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const StyledIcon = styled(Icon)`
  position: absolute;
  top: 50%;
  right: ${rem(13)};
  transform: translateY(-50%);
  transform: rotate(${props => (props.open ? 180 : 0)}deg);
`;

export const StyledSelect = styled.div`
  color: ${props => props.theme.colors.nature.n3};
`;

export const Option = styled.div`
  ${({ theme }) => css`
    padding: ${rem(4)} ${rem(10)};
    cursor: pointer;
    &:hover {
      color: ${theme.colors.nature.n0};
      background: ${theme.colors.primary.p1};
    }
  `}
`;

export const Label = styled(Typography).attrs({ variant: 'caption1' })`
  ${({ theme }) => css`
    color: ${theme.colors.nature.n5};
    font-size: ${rem(14)};
  `}
`;
