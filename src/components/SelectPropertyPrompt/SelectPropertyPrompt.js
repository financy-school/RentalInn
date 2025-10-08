import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../StandardText/StandardText';
import { ThemeContext } from '../../context/ThemeContext';
import colors from '../../theme/colors';

const SelectPropertyPrompt = ({ title, description, onSelectProperty }) => {
  const { theme: mode } = useContext(ThemeContext);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  return (
    <View style={styles.container}>
      <Card style={[styles.promptCard, { backgroundColor: cardBackground }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="home-search"
              size={48}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.content}>
          <StandardText
            size="xl"
            fontWeight="bold"
            style={[styles.title, { color: textPrimary }]}
            textAlign="center"
          >
            {title}
          </StandardText>

          <StandardText
            size="md"
            style={[styles.description, { color: textSecondary }]}
            textAlign="center"
          >
            {description}
          </StandardText>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={onSelectProperty}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={20}
              color={colors.white}
              style={styles.buttonIcon}
            />
            <StandardText
              size="md"
              fontWeight="semibold"
              style={styles.buttonText}
            >
              Select Property
            </StandardText>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  promptCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary + '30',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 280,
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: colors.white,
  },
});

export default SelectPropertyPrompt;
