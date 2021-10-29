import styled, { css } from 'styled-components';

import { rem } from 'styles';

import { Page, PageBody } from 'components/_shared/Page';
import { Paper } from 'components/_shared/Paper';
import { StyledAreasSidebarToggle } from 'components/Areas';

export const PageMainContainer = styled(Paper)`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    background: ${theme.colors.nature.n1};
    padding: 0;
  `}
`;

export const StyledPageMain = styled(Page)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    ${PageBody} {
      flex: 1;
    }

    ${StyledAreasSidebarToggle} {
      position: absolute;
      top: ${rem(theme.spacing[11])};
      left: ${rem(theme.spacing[11])};
    }
  `}
`;
