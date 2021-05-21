import { cloneElement } from 'react';
import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Paper } from '../Paper';

export const DropdownChild = styled(({ children, ...props }) => {
  return cloneElement(children, props);
})``;

export const StyledDropdown = styled(Paper)`
  ${({ theme }) => css`
    position: absolute;
    top: ${`calc(100% + ${rem(8)})`};
    z-index: ${theme.zIndexes[1]};

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${rem(9)};
      transform: translateY(-100%);
    }
  `}
`;
