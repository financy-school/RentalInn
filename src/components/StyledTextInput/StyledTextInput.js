import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import StandardText from '../StandardText/StandardText';

const StyledTextInput = ({
  label,
  error,
  helperText,
  containerStyle,
  ...props
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <StandardText size="sm" fontWeight="600" style={styles.label}>
          {label}
        </StandardText>
      )}
      <TextInput
        {...props}
        style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
          },
          props.style,
        ]}
        theme={{
          colors: {
            primary: theme.colors.primary,
            outline: error ? theme.colors.error : theme.colors.outline,
          },
        }}
        contentStyle={{
          paddingLeft: 16,
        }}
      />
      {(error || helperText) && (
        <StandardText
          size="xs"
          style={[
            styles.helperText,
            {
              color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {error || helperText}
        </StandardText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default StyledTextInput;
