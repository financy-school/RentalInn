import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import colors from '../theme/color';
import { ThemeContext } from '../context/ThemeContext';

const KeyBoardAvoidingWrapper = ({ children }) => {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const { theme: mode } = useContext(ThemeContext);

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: backgroundColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default KeyBoardAvoidingWrapper;
