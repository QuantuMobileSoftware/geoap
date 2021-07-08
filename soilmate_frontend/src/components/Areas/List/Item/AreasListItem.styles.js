import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { Typography } from 'components/_shared/Typography';
import { Image } from 'components/_shared/Image';
import { Menu, MenuDropdown } from 'components/_shared/Menu';
import { Button } from 'components/_shared/Button';

export const AreasListItemMenu = styled(Menu)`
  align-self: center;
  margin-left: auto;

  ${MenuDropdown} {
    right: 0;
    ${({ theme }) => css`
      padding: ${rem(theme.spacing[2])} ${rem(theme.spacing[7])};
    `}
  }

  &:not(.isOpen) {
    display: none;
  }
`;

export const AreasIconButtonsHolder = styled.div`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  display: none;
`;

export const AreasIconButton = styled(Button)`
  width: ${em(34)};
  height: ${em(34)};
  margin-left: 10px;
  background: white;
  cursor: pointer;
  border-radius: 50%;
`;

export const AreasListItemButton = styled(Button)`
  ${({ theme }) => css`
    padding: ${rem(theme.spacing[2])} 0;
  `}
`;

export const AreasListItemCoordinate = styled(Typography).attrs({
  element: 'p',
  variant: 'caption1'
})`
  ${({ theme }) => css`
    &:not(:first-child) {
      margin-left: ${rem(theme.spacing[3])};
    }
  `}
`;

export const AreasListItemCoordinates = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    margin-top: ${rem(theme.spacing[0])};
  `}
`;

export const AreasListItemName = styled(Typography).attrs({
  element: 'h4',
  variant: 'body1'
})``;

export const AreasListItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  > * {
    transition: inherit;
  }
`;

export const AreasListItemThumbnail = styled(Image)`
  ${({ theme }) => css`
    width: ${rem(34)};
    height: ${rem(34)};
    border-radius: ${rem(theme.radius[1])};
    margin-right: ${rem(theme.spacing[4])};
  `}
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
        top: ${em(-75)};
      }`
        : null}

      &:hover {
        background: ${theme.colors.primary.p4};

        ${AreasListItemBody} {
          color: ${theme.colors.primary.p1};
        }

        ${AreasListItemMenu}, ${AreasIconButtonsHolder} {
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
