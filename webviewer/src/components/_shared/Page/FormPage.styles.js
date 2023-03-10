import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Page } from './Page';
import { StyledPaper } from 'components/_shared/Paper';
import { StyledLogo } from 'components/Logo';

export const StyledFormPage = styled(Page)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;

    ${StyledPaper} {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    ${StyledLogo} {
      margin-bottom: ${rem(theme.spacing[10])};
    }
  `}
`;
