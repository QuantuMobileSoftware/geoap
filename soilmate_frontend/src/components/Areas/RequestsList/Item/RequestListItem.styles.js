import styled, { css } from 'styled-components';

import { rem, em } from 'styles';

import { Typography } from 'components/_shared/Typography';

export const RequestListItemText = styled(Typography).attrs({
  element: 'h4',
  variant: 'body1'
})`
  line-height: ${rem(16)};
  cursor: pointer;
`;

export const RequestListItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${em(10)};
  > * {
    transition: inherit;
  }
`;

export const RequestListItem = styled.li`
  ${({ theme, onClick, isActive, top }) => [
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

        ${RequestListItemBody} {
          color: ${theme.colors.primary.p1};
        }
      }
    `,
    onClick && 'cursor: pointer;'
  ]}
`;
