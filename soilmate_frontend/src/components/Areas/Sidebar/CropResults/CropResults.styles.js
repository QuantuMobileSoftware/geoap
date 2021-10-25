import styled, { css } from 'styled-components';
import { rem, em, sidebarList, sidebarBtnMargin } from 'styles';

export const LabelsItem = styled.li`
  display: flex;
  margin-bottom: ${em(16)};
  &:last-child {
    margin-bottom: 0;
  }
`;

export const ColorBlock = styled.div`
  ${({ theme, color }) => css`
    margin-right: ${em(10)};
    background-color: rgb(${color});
    width: ${em(44)};
    height: ${em(44)};
    border-radius: ${rem(theme.radius[1])};
  `}
`;

export const ButtonWrapper = styled.div`
  ${({ theme }) => css`
    text-align: right;
    margin-top: ${em(sidebarBtnMargin)};
    & button:first-child {
      margin-right: ${em(32, theme.fontSizes[2])};
      border: ${theme.borders.default(theme.fontSizes[2])};
      font-weight: ${theme.fontWeights[1]};
    }
  `}
`;

export const Title = styled.h3`
  ${({ theme }) => css`
    margin-bottom: ${em(16)};
    font-size: ${rem(14)};
    color: ${theme.colors.nature.n5};
  `}
`;

export const List = styled.ul`
  ${sidebarList}
`;
