import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import colors from '../theme/colors';

const KeyBoardAvoidingWrapper = ({ children }) => {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const { theme: mode } = useContext(ThemeContext);

  const backgroundColor = colors.secondary;

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
