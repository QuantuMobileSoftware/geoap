import styled, { css } from 'styled-components';

import { rem, em, sidebarListItem } from 'styles';
import { rgba } from 'polished';

import { Typography } from 'components/_shared/Typography';

export const ReportListItemText = styled(Typography).attrs({
  element: 'h4',
  variant: 'body1'
})`
  ${({ theme: { colors }, $hasData }) => css`
    color: ${$hasData ? colors.nature.n5 : colors.danger};
    line-height: ${rem(16)};
    cursor: pointer;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: ${em(290)};
  `}
`;

export const ReportListItemDate = styled.div`
  ${({ theme }) => css`
    margin-top: ${rem(4)};
    color: ${theme.colors.nature.n4};
    font-size: ${em(13)};
  `}
`;
export const ReportListItemBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  margin-left: ${em(10)};
  > * {
    transition: inherit;
  }
`;

export const ReportStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${em(8)};
  font-size: ${rem(10)};
  svg {
    width: ${rem(9)};
  }
`;

export const ResultListItem = styled.li`
  ${({ theme, onClick, isActive }) => {
    const mainColor = theme.colors.primary.p1;
    return [
      css`
        ${sidebarListItem};
        background: ${isActive ? rgba(mainColor, 0.2) : theme.colors.nature.n0};
        padding-left: ${em(42)};

        &:hover {
          ${isActive ? '' : `background: ${rgba(mainColor, 0.1)}`};

          ${ReportListItemBody} {
            color: ${theme.colors.primary.p1};
          }
        }
      `,
      onClick && 'cursor: pointer;'
    ];
  }}
`;

export const ReportListFolder = styled.li`
  ${({ theme, isOpen }) => {
    const mainColor = theme.colors.primary.p1;
    return css`
      ${sidebarListItem};
      background: ${isOpen ? rgba(mainColor, 0.1) : theme.colors.nature.n0};
      cursor: pointer;

      &:hover {
        background: ${rgba(mainColor, 0.2)}
    `;
  }}
`;

export const EstimatedTime = styled.div`
  ${({ theme }) => css`
    margin-top: ${rem(3)};
    color: ${theme.colors.nature.n4};
    font-size: ${em(10)};
  `}
`;
