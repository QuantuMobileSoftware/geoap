import styled, { css } from 'styled-components';

import { VIEWPORT_PADDING } from '_constants';

import { rem } from 'styles';

import { Page, PageBody } from 'components/_shared/Page';
import { Paper } from 'components/_shared/Paper';
import { StyledAreasSidebarToggle } from 'components/Areas';

export const PageMainContainer = styled(Paper)`
  position: relative;
  height: 100%;
  padding: 0;
`;

export const StyledPageMain = styled(Page)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    ${PageBody} {
      flex: 1;
      padding: ${rem(VIEWPORT_PADDING)};
    }

    ${StyledAreasSidebarToggle} {
      position: absolute;
      top: ${rem(theme.spacing[11])};
      left: ${rem(theme.spacing[11])};
    }
  `}
`;
