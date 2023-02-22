import styled, { css } from 'styled-components';

import { rem, em, sidebarListItem } from 'styles';
import { rgba } from 'polished';

import { Typography } from 'components/_shared/Typography';
import { Menu, MenuDropdown } from 'components/_shared/Menu';
import { Button } from 'components/_shared/Button';

export const AreasListItemMenu = styled(Menu)`
  align-self: center;
  margin-left: auto;

  ${MenuDropdown} {
    right: ${rem(15)};
    ${({ theme }) => css`
      padding: ${rem(theme.spacing[2])} ${rem(theme.spacing[7])};
    `}
  }
`;

export const AreasListItemButton = styled(Button)`
  ${({ theme }) => css`
    padding: ${rem(theme.spacing[2])} 0;
    display: inline-block;
    width: 100%;
    text-align: left;
  `}
`;

export const AreasListItemSize = styled(Typography).attrs({
  element: 'p',
  variant: 'caption1'
})`
  font-size: ${em(13)};
`;

export const AreasListItemName = styled(Typography).attrs({
  element: 'h4',
  variant: 'body1'
})``;

export const AreasListItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${em(10)};

  > * {
    transition: inherit;
  }
`;

export const AreasListItem = styled.li`
  ${({ theme, hasCoordinates, onClick, isActive, top }) => {
    const mainColor = theme.colors.primary.p1;
    return [
      css`
        ${sidebarListItem};
        background: ${isActive ? rgba(mainColor, 0.2) : theme.colors.nature.n0};

        ${top
          ? `.isOpen > div {
          top: auto;
          bottom: 0;
        }`
          : null}

        &:hover {
          ${isActive ? '' : `background: ${rgba(mainColor, 0.1)}`};

          ${AreasListItemBody} {
            color: ${theme.colors.primary.p1};
          }

          ${AreasListItemMenu}, ${AreasListItemMenu} {
            display: flex;
          }
        }
      `,
      onClick && 'cursor: pointer;',
      hasCoordinates &&
        css`
          ${AreasListItemName} {
            margin-top: -${rem(3)};
          }
        `
    ];
  }}
`;
