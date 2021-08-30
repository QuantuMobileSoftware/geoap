import styled, { css } from 'styled-components';

import { em, rem } from 'styles';

import { Sidebar, SidebarBody } from 'components/_shared/Sidebar';
import { Typography } from 'components/_shared/Typography';
import { Button } from 'components/_shared/Button';

export const AreasSidebarButton = styled(Button)`
  ${({ theme }) => css`
    margin: ${rem(theme.spacing[6])} auto ${rem(theme.spacing[6])} 0;
  `}
`;

export const AreasSidebarMessage = styled(Typography).attrs({
  element: 'p',
  variant: 'body2'
})`
  ${({ theme }) => css`
    text-align: center;
    padding: ${em([theme.spacing[11], theme.spacing[11], theme.spacing[8]])};
  `}
`;

export const StyledAreasSidebar = styled(Sidebar)`
  ${SidebarBody} {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;
