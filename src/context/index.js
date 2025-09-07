import React from 'react';
import {CredentialsProvider} from './CredentialsContext';
import {ThemeProvider} from './ThemeContext';

export const AppProvider = ({children}) => {
  return (
    <CredentialsProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </CredentialsProvider>
  );
};
