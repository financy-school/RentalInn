import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/layout';
import Gap from '../Gap/Gap';

const { width } = Dimensions.get('window');

const PaymentMethodPicker = ({
  visible,
  onDismiss,
  onSelect,
  selectedMethod,
  methods,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const handleSelect = method => {
    onSelect(method);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={styles.modalContainer}
          onPress={e => e.stopPropagation()}
        >
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: cardBackground },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View
                  style={[
                    styles.headerIconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <StandardText
                  fontWeight="bold"
                  size="lg"
                  style={{ color: textPrimary }}
                >
                  Select Payment Method
                </StandardText>
              </View>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={28}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Gap size="md" />

            {/* Methods List */}
            <ScrollView style={styles.methodsList}>
              {methods.map((method, index) => {
                const isSelected = selectedMethod === method.value;
                return (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.methodItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primary + '10'
                          : 'transparent',
                        borderColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.borderDark
                          : colors.borderLight,
                      },
                      index === methods.length - 1 && { marginBottom: 0 },
                    ]}
                    onPress={() => handleSelect(method.value)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.methodIconContainer,
                        {
                          backgroundColor: isSelected
                            ? colors.primary + '20'
                            : colors.primary + '10',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={method.icon}
                        size={24}
                        color={isSelected ? colors.primary : textSecondary}
                      />
                    </View>
                    <View style={styles.methodInfo}>
                      <StandardText
                        fontWeight={isSelected ? 'bold' : '600'}
                        style={{
                          color: isSelected ? colors.primary : textPrimary,
                          fontSize: 16,
                        }}
                      >
                        {method.label}
                      </StandardText>
                      {method.description && (
                        <StandardText
                          style={{ color: textSecondary, fontSize: 12 }}
                        >
                          {method.description}
                        </StandardText>
                      )}
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.92,
    maxWidth: 420,
    maxHeight: '70%',
  },
  pickerContainer: {
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  methodsList: {
    maxHeight: 400,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.medium,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
});

export default PaymentMethodPicker;
