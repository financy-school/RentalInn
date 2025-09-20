import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../StandardText/StandardText';

const StandardHeader = ({
  navigation,
  title,
  loading = false,
  showBackButton = true,
  rightComponent,
  containerStyle,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    headerSpacer: {
      width: 40, // Same width as back button to center the title
    },
  });

  return (
    <View style={[styles.customHeader, containerStyle]}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (!loading) navigation.goBack();
          }}
          disabled={loading}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}

      <StandardText size="lg" fontWeight="600" style={styles.headerTitle}>
        {title}
      </StandardText>

      {rightComponent ? rightComponent : <View style={styles.headerSpacer} />}
    </View>
  );
};

export default StandardHeader;
