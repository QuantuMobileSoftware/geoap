import { createGlobalStyle, css } from 'styled-components';

import './vendors/reset.css';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    ${({ theme }) => css`
      font-family: ${theme.fonts.primary}, sans-serif;
      font-size: ${`${theme.fontSizes.sm}px`};
      font-weight: ${theme.fontWeights.regular};
      line-height: ${theme.lineHeight.x};
      color: ${theme.colors.nature.n5};
      background: ${theme.colors.misc.background};
    `}
  }

  code {
    font-family: monospace;
  }
`;
