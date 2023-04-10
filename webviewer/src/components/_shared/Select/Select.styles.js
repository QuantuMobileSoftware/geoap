import styled, { css } from 'styled-components';

import { rem, scrollbar } from 'styles';
import { SelectToggleGeneral } from 'styles';
import { Dropdown } from '../Dropdown';
import { Typography } from '../Typography';
import { Icon } from 'components/_shared/Icon';

export const SelectDropdown = styled(Dropdown)`
  min-width: 100%;
  max-height: ${rem(200)};
  top: ${rem(43)};
  left: 0;
  padding: 0;
  overflow: auto;
  ${scrollbar}
`;

export const SelectToggle = styled.div`
  ${SelectToggleGeneral}
  position: relative;
  cursor: pointer;
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
