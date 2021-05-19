import styled, { css } from 'styled-components';

import { VIEWPORT_PADDING } from '_constants';

import { rem } from 'styles';

import { StyledLogo } from 'components/Logo';
import { StyledUserbar } from 'components/Userbar';

export const StyledHeader = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows()[0]};
    padding: ${rem([theme.spacing[3], VIEWPORT_PADDING])};

    ${StyledLogo} {
      margin-right: auto;
    }

    ${StyledUserbar} {
      margin-left: ${rem(theme.spacing[9])};
    }
  `}
`;
