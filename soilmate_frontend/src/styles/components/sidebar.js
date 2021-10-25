import { css } from 'styled-components';

import { rem, em } from 'styles';

export const sidebarList = ({ theme }) => css`
  padding-top: ${rem(theme.spacing[2])};
  max-height: calc(100vh - 300px - 50px);
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

export const sidebarListItem = ({ theme }) => css`
  position: relative;
  display: flex;
  justify-content: flex-start;
  padding: ${rem([theme.spacing[5], theme.spacing[6]])};
  transition: ${theme.transitions.fast};
`;

export const sidebarTopButtons = css`
  display: flex;
  margin-top: ${em(16)};
  & button {
    padding-left: 0;
    color: ${({ theme }) => theme.colors.nature.n4};
    font-size: ${rem(13)};
    font-weight: normal;
  }
`;

export const sidebarBtnMargin = 24;
