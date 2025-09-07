import React, { useState, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SimpleAccordion = ({
  title,
  children,
  titleStyle = {},
  contentStyle = {},
  containerStyle = {},
  expandedBackgroundColor,
  collapsedBackgroundColor,
  titleColor,
  iconColor,
  animationDuration = 300,
  initialExpanded = false,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpanded = () => {
    // Smooth animation for expand/collapse
    LayoutAnimation.configureNext({
      duration: animationDuration,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setExpanded(!expanded);
  };

  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
      backgroundColor: expanded
        ? expandedBackgroundColor || (mode === 'dark' ? '#1a1a1a' : '#ffffff')
        : collapsedBackgroundColor || (mode === 'dark' ? '#2a2a2a' : '#f8f9fa'),
      borderWidth: 1,
      borderColor: mode === 'dark' ? '#404040' : '#e0e0e0',
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      minHeight: 56,
    },
    titleContainer: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: titleColor || theme.colors.onSurface,
      lineHeight: 22,
    },
    iconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 18,
      color: iconColor || theme.colors.primary,
      fontWeight: 'bold',
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 0,
    },
    contentText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityHint={`Tap to ${expanded ? 'collapse' : 'expand'} section`}
      >
        <View style={styles.titleContainer}>
          <StandardText style={[styles.title, titleStyle]}>
            {title}
          </StandardText>
        </View>
        <View style={styles.iconContainer}>
          <StandardText style={styles.icon}>
            {expanded ? '−' : '+'}
          </StandardText>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.content, contentStyle]}>
          {typeof children === 'string' ? (
            <StandardText style={styles.contentText}>{children}</StandardText>
          ) : (
            children
          )}
        </View>
      )}
    </View>
  );
};

export default SimpleAccordion;
