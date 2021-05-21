import styled, { css } from 'styled-components';

import { em, rem } from 'styles';

import { Sidebar, SidebarBody } from 'components/_shared/Sidebar';
import { StyledSearch } from 'components/_shared/Search';
import { Typography } from 'components/_shared/Typography';
import { Button } from 'components/_shared/Button';

export const AreasSidebarButtonAddArea = styled(Button)`
  ${({ theme }) => css`
    margin-top: ${rem(theme.spacing[10])};
    margin-left: auto;
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
  ${({ theme }) => css`
    ${SidebarBody} {
      display: flex;
      flex-direction: column;
    }

    ${StyledSearch} {
      margin-top: ${rem(theme.spacing[11])};
    }
  `}
`;
