import styled, { css } from 'styled-components';

import { VIEWPORT_PADDING } from '_constants';

import { rem } from 'styles';

import { StyledUserbar } from 'components/Userbar';

export const StyledHeader = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.nature.n0};
    box-shadow: ${theme.shadows()[0]};
    padding: ${rem([theme.spacing[3], VIEWPORT_PADDING])};

    ${StyledUserbar} {
      margin-left: ${rem(theme.spacing[9])};
    }
  `}
`;
