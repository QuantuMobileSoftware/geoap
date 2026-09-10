import styled, { css } from 'styled-components';
import { em, rem } from 'styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${em(12)};
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${em(12)};
`;

export const PageTitle = styled.h1`
  ${({ theme }) => css`
    font-family: ${theme.fonts.display};
    font-size: ${rem(23)};
    font-weight: ${theme.fontWeights[1]};
    text-transform: uppercase;
    color: ${theme.colors.nature.n5};
    margin: 0;
  `}
`;

export const AccountName = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.fonts.mono};
    font-size: ${rem(12)};
    color: ${theme.colors.nature.n4};
    padding: ${em(4)} ${em(9)};
    background: ${theme.colors.misc.background};
    border: ${theme.borders.default({ fontSize: theme.fontSizes[2] })};
    border-radius: ${em(theme.radius[0])};
  `}
`;
