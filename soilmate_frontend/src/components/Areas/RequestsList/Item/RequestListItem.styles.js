import styled, { css } from 'styled-components';

import { rem, em, sidebarListItem } from 'styles';
import { rgba } from 'polished';

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
  ${({ theme, onClick, isActive }) => {
    const mainColor = theme.colors.primary.p1;
    return [
      css`
        ${sidebarListItem};
        background: ${isActive ? rgba(mainColor, 0.2) : theme.colors.nature.n0};

        &:hover {
          ${isActive ? '' : `background: ${rgba(mainColor, 0.1)}`};

          ${RequestListItemBody} {
            color: ${theme.colors.primary.p1};
          }
        }
      `,
      onClick && 'cursor: pointer;'
    ];
  }}
`;
