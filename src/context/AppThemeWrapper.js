import React, {useContext} from 'react';
import {PaperProvider} from 'react-native-paper';
import {ThemeContext} from './ThemeContext';
import {darkTheme, lightTheme} from '../theme/theme';

const AppThemeWrapper = ({children}) => {
  const {theme} = useContext(ThemeContext);

  const paperTheme = theme === 'dark' ? darkTheme : lightTheme;

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
};

export default AppThemeWrapper;
