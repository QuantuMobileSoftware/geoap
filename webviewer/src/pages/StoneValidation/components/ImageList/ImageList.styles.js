import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  padding: ${em(10)} 0;
  font-size: ${rem(14)};
  color: ${({ theme }) => theme.colors.nature.n4};
  min-width: 320px;
  position: relative;
  table {
    width: 100%;
  }
  td,
  th {
    padding: 10px 20px;
    text-align: left;
  }
`;

export const TableWrap = styled.div`
  overflow-y: auto;
`;

export const TableHeader = styled.th`
  ${({ theme }) => css`
    padding: 10px;
    color: ${theme.colors.nature.n3};
    font-weight: ${theme.fontWeights[1]};
  `}
`;

export const TableRow = styled.tr`
  ${({ theme, isActive }) => [
    css`
      cursor: pointer;
      &:nth-child(even) {
        background: ${theme.colors.nature.n2};
      }
      &:hover {
        box-shadow: inset 0 0 8px 0 ${theme.colors.nature.n4};
      }
    `,
    isActive &&
      css`
        background: ${theme.colors.primary.p1} !important;
        color: ${theme.colors.nature.n0} !important;
        box-shadow: inset 0 0 8px 0 ${theme.colors.nature.n4};
      `
  ]}
`;

export const Pagination = styled.div`
  ${({ theme }) => css`
    background: ${theme.colors.primary.p1};
    color: ${theme.colors.primary.p4};
    ul {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${em(10)};
    }
    li {
      cursor: pointer;
      &:hover {
        color: ${theme.colors.primary.p3};
      }
      &.selected {
        text-decoration: underline;
        color: ${theme.colors.primary.p4};
        font-weight: ${theme.fontWeights[1]};
      }
      &.next a,
      &.previous a {
        font-size: ${rem(20)};
        padding: 0 4px;
      }
    }
  `}
`;
