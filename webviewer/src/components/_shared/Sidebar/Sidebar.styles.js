import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { Button, ButtonIcon } from '../Button';
import { Paper } from '../Paper';
import { Typography } from '../Typography';

export const SidebarBody = styled.div`
  flex-grow: 1;
`;

export const BreadcrumbsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${em(14)};
`;

export const SidebarHeading = styled(Typography).attrs({
  element: 'h2',
  variant: 'h2'
})`
  margin-bottom: ${em(16)};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SidebarButtonClose = styled(Button).attrs({
  variant: 'floating',
  icon: 'Cross'
})`
  ${({ theme }) => css`
    border: ${theme.borders.default(theme.fontSizes[1])};
    width: ${rem(35)};
    height: ${rem(35)};
    ${ButtonIcon} {
      width: ${rem(12)};
    }
  `}
`;
export const BasicSidebar = styled(Paper).attrs({ padding: 1 })`
  width: ${rem(300)};
  height: 100%;
  border-radius: 0;
`;

export const StyledSidebar = styled(BasicSidebar)`
  ${({ theme, withUnmountToggle }) => [
    css`
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      z-index: ${theme.zIndexes[1]};
    `,
    !withUnmountToggle &&
      css`
        &:not(.isOpen) {
          display: none;
        }
      `
  ]}
`;

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    text-align: center;
    & button:first-child {
      margin-right: ${em(32, theme.fontSizes[2])};
      border: ${theme.borders.default(theme.fontSizes[2])};
    }
  `}
`;
