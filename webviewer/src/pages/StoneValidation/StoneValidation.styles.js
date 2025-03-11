import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.main`
  display: flex;
  align-items: flex-start;
  height: calc(100% - 90px);
  gap: ${em(20)};
`;

export const StoneTableWrap = styled.div`
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  padding: ${em(10)} 0;
  font-size: ${rem(14)};
  color: ${({ theme }) => theme.colors.nature.n4};
  td,
  th {
    padding: 10px 20px;
    text-align: left;
  }
`;

export const TableHeader = styled.th`
  ${({ theme }) => `
   padding: 10px;
   color: ${theme.colors.nature.n3};
   font-weight: ${theme.fontWeights[1]};
 `}
`;

export const TableRow = styled.tr`
  ${({ theme, isActive }) => [
    css`
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
