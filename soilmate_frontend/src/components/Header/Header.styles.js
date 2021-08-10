import styled, { css } from 'styled-components';

import { VIEWPORT_PADDING } from '_constants';

import { em, rem } from 'styles';

import { StyledMenu } from './Menu';
import { StyledUserbar } from 'components/Userbar';

export const StyledHeader = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows()[0]};
    padding: ${rem([theme.spacing[3], VIEWPORT_PADDING])};

    ${StyledMenu} {
      margin-right: auto;
      margin-left: ${em(25)};
    }

    ${StyledUserbar} {
      margin-left: ${rem(theme.spacing[9])};
    }
  `}
`;
