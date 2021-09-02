import { css } from 'styled-components';

import { rem } from 'styles';

export const sidebarListStyle = ({ theme }) => css`
  padding-top: ${rem(theme.spacing[2])};
  max-height: calc(100vh - 300px - 70px);
  overflow-y: auto;
  &::-webkit-scrollbar-track {
    background-color: ${theme.colors.nature.n2};
    border-radius: ${rem(10)};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.primary.p1};
    border-radius: ${rem(10)};
  }
  &::-webkit-scrollbar {
    width: 6px;
  }
`;
