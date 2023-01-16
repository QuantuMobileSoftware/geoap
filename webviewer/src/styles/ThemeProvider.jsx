import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { themes } from './themes';
import { GlobalStyle } from './GlobalStyle';

export const ThemeProvider = ({ children }) => {
  // * Can be replaced with a global state theme
  const activeTheme = themes.themeDefault;

  return (
    <StyledThemeProvider theme={activeTheme}>
      <GlobalStyle />
      {children}
    </StyledThemeProvider>
  );
};
