import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from 'styles';
import { Routes } from 'routes';
import { ErrorModal } from 'components/ErrorModal';

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes />
        <ErrorModal />
      </BrowserRouter>
    </ThemeProvider>
  );
};
