import React, { useContext } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          {children}
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyBoardAvoidingWrapper;
