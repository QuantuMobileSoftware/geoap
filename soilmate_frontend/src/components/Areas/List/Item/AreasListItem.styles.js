import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

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

  &:not(.isOpen) {
    display: none;
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
  ${({ theme, hasCoordinates, onClick, isActive, top }) => [
    css`
      position: relative;
      display: flex;
      justify-content: flex-start;
      background: ${isActive ? theme.colors.primary.p4 : theme.colors.nature.n0};
      padding: ${rem([theme.spacing[8] - 3, theme.spacing[8]])};
      transition: ${theme.transitions.fast};

      &:nth-child(even) {
        background: ${isActive ? theme.colors.primary.p4 : theme.colors.misc.background3};
      }

      ${top
        ? `.isOpen > div {
        top: auto;
        bottom: 0;
      }`
        : null}

      &:hover {
        background: ${theme.colors.primary.p4};

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
  ]}
`;
