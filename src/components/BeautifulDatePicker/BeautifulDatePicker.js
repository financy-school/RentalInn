import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Portal, Modal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-ui-datepicker';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';
import { RADIUS, SPACING } from '../../theme/layout';
import Gap from '../Gap/Gap';

const { width } = Dimensions.get('window');

const BeautifulDatePicker = ({
  visible,
  onDismiss,
  onDateSelect,
  title = 'Select Date',
  initialDate = null,
  minDate = null,
  maxDate = null,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? new Date(initialDate) : new Date(),
  );

  useEffect(() => {
    if (visible) {
      setCurrentMonth(initialDate ? new Date(initialDate) : new Date());
    }
  }, [visible, initialDate]);

  const handleDateChange = params => {
    const raw = params && params.date ? params.date : params;
    if (!raw) return;

    const dateObj = raw instanceof Date ? new Date(raw) : new Date(raw);
    const normalized = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      12,
      0,
      0,
      0,
    );

    onDateSelect(normalized);
    onDismiss();
  };

  const goToPreviousYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentMonth(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View
          style={[
            styles.datePickerContainer,
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
                  name="calendar-month"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: textPrimary }}
              >
                {title}
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

          {/* Year Navigation */}
          <View style={styles.yearNavigation}>
            <TouchableOpacity
              onPress={goToPreviousYear}
              style={[
                styles.yearNavButton,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.primary + '30',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-double-left"
                size={24}
                color={colors.primary}
              />
              <StandardText
                size="xs"
                fontWeight="semibold"
                style={{ color: colors.primary }}
              >
                Year
              </StandardText>
            </TouchableOpacity>

            <View style={styles.yearDisplay}>
              <StandardText
                fontWeight="bold"
                size="xl"
                style={{ color: colors.primary }}
              >
                {currentMonth.getFullYear()}
              </StandardText>
            </View>

            <TouchableOpacity
              onPress={goToNextYear}
              style={[
                styles.yearNavButton,
                {
                  backgroundColor: colors.white,
                  borderColor: colors.primary + '30',
                },
              ]}
            >
              <StandardText
                size="xs"
                fontWeight="semibold"
                style={{ color: colors.primary }}
              >
                Year
              </StandardText>
              <MaterialCommunityIcons
                name="chevron-double-right"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Gap size="sm" />

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={[styles.monthNavButton, { backgroundColor: colors.white }]}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={32}
                color={colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.monthDisplay}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: textPrimary }}
              >
                {currentMonth.toLocaleDateString('en-IN', {
                  month: 'long',
                })}
              </StandardText>
            </View>

            <TouchableOpacity
              onPress={goToNextMonth}
              style={[styles.monthNavButton, { backgroundColor: colors.white }]}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={32}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Gap size="md" />

          {/* Calendar */}
          <View style={styles.calendarWrapper}>
            <DatePicker
              mode="single"
              date={currentMonth}
              onChange={handleDateChange}
              selectedItemColor={colors.primary}
              headerButtonColor={colors.primary}
              calendarTextStyle={{ color: textPrimary, fontSize: 15 }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary, fontWeight: '600' }}
              selectedTextStyle={{ color: colors.white, fontWeight: 'bold' }}
              todayTextStyle={{ color: colors.primary }}
              todayContainerStyle={{
                borderWidth: 2,
                borderColor: colors.primary + '40',
              }}
              timePicker={false}
              headerButtonsPosition="none"
              minDate={minDate}
              maxDate={maxDate}
            />
          </View>

          <Gap size="md" />

          {/* Quick Action: Go to Today */}
          <TouchableOpacity
            onPress={goToToday}
            style={[
              styles.todayButton,
              { backgroundColor: colors.primary + '10' },
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-today"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="semibold"
              size="md"
              style={{ color: colors.primary }}
            >
              Go to Today
            </StandardText>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    borderRadius: RADIUS.large,
    padding: SPACING.lg,
    width: width * 0.92,
    maxWidth: 420,
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
  yearNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: colors.primary + '08',
    borderRadius: RADIUS.medium,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  yearNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.small,
    borderWidth: 1,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  yearDisplay: {
    paddingHorizontal: SPACING.lg,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: colors.primary + '12',
    borderRadius: RADIUS.medium,
  },
  monthNavButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.small,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  calendarWrapper: {
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    backgroundColor: colors.white + '05',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.medium,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
});

export default BeautifulDatePicker;
