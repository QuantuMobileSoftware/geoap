import styled from 'styled-components';
import { em } from 'styles';
import { rgba } from 'polished';
import { Button } from 'components/_shared/Button';

const tableCellPadding = 20;

export const TableHeader = styled.th`
  ${({ theme }) => `
   padding-right: ${em(70)};
   padding-bottom: ${em(20)};
   color: ${theme.colors.nature.n3};
   font-weight: ${theme.fontWeights[1]};
   text-align: left;
 `}
`;

export const TableComment = styled.td`
  ${({ theme }) => `
   padding-right: ${em(tableCellPadding)};
   padding-bottom: ${em(tableCellPadding)};
   color: ${theme.colors.nature.n4};
 `}
`;

export const TableAmount = styled.td`
  ${({ theme, negative }) => `
   padding-bottom: ${em(tableCellPadding)};
   font-weight: ${theme.fontWeights[1]};
   color: ${negative ? rgba(theme.colors.danger, 0.8) : theme.colors.primary.p1};
 `}
`;

export const LayerName = styled.span`
  ${({ theme }) => `
   font-weight: ${theme.fontWeights[1]};
   color: ${theme.colors.nature.n5};
 `}
`;

export const Filter = styled.div`
  display: flex;
  padding: ${em(20)} 0;
`;

export const ClearFilterBtn = styled(Button)`
  margin-left: 40px;
`;
