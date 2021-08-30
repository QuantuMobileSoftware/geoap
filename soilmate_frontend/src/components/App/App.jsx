import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from 'styles';
import { Routes } from 'routes';

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </ThemeProvider>
  );
};
