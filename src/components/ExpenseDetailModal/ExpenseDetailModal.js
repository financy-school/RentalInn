import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Portal, Modal, Button, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';
import Gap from '../Gap/Gap';
import colors from '../../theme/color';

const ExpenseDetailModal = ({ visible, expense, onDismiss, theme }) => {
  const isDark = theme === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const modalBackground = isDark ? colors.backgroundDark : colors.white;

  if (!expense) return null;

  const getStatusColor = status => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryIcon = category => {
    switch (category) {
      case 'maintenance':
        return 'wrench';
      case 'utilities':
        return 'flash';
      case 'repair':
        return 'hammer-wrench';
      case 'cleaning':
        return 'broom';
      default:
        return 'cash';
    }
  };

  const handleShareInvoice = async () => {
    try {
      const invoiceText = `
EXPENSE INVOICE
${expense.invoiceNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vendor: ${expense.vendor}
Property: ${expense.propertyName}

Expense: ${expense.title}
Category: ${expense.category}
Amount: ₹${expense.amount.toLocaleString()}

Due Date: ${expense.dueDate}
Payment Date: ${expense.date || 'Not Paid'}
Payment Method: ${expense.paymentMethod}
Status: ${expense.status.toUpperCase()}

Description: ${expense.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Property Management System
      `.trim();

      await Share.open({
        title: 'Share Invoice',
        message: invoiceText,
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing invoice:', error);
        Alert.alert('Error', 'Failed to share invoice');
      }
    }
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this expense as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Implement API call
            Alert.alert('Success', 'Expense marked as paid');
            onDismiss();
          },
        },
      ],
    );
  };

  const handleEditExpense = () => {
    Alert.alert('Edit Expense', 'Edit expense functionality coming soon!');
  };

  const handleDeleteExpense = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement API call
            Alert.alert('Success', 'Expense deleted successfully');
            onDismiss();
          },
        },
      ],
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View
          style={[styles.modalContent, { backgroundColor: modalBackground }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: getStatusColor(expense.status) + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    expense.status === 'paid'
                      ? 'check-circle'
                      : expense.status === 'overdue'
                      ? 'alert-circle'
                      : 'clock-outline'
                  }
                  size={32}
                  color={getStatusColor(expense.status)}
                />
              </View>
              <View style={styles.headerText}>
                <StandardText
                  fontWeight="bold"
                  size="xl"
                  style={{ color: textPrimary }}
                >
                  Expense Details
                </StandardText>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  {expense.invoiceNumber}
                </StandardText>
              </View>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount Section */}
            <StandardCard
              style={[styles.amountCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.amountSection}>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  Expense Amount
                </StandardText>
                <StandardText
                  fontWeight="bold"
                  style={[
                    styles.amount,
                    { color: getStatusColor(expense.status) },
                  ]}
                >
                  ₹{expense.amount.toLocaleString()}
                </StandardText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(expense.status) + '20' },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="sm"
                    style={{ color: getStatusColor(expense.status) }}
                  >
                    {expense.status.toUpperCase()}
                  </StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="lg" />

            {/* Expense Information */}
            <StandardText
              fontWeight="bold"
              size="md"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Expense Information
            </StandardText>
            <Gap size="sm" />
            <StandardCard
              style={[styles.infoCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="receipt-text"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Expense Title
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.title}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="store"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Vendor
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.vendor}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Property
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.propertyName}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(expense.category)}
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Category
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.category.charAt(0).toUpperCase() +
                      expense.category.slice(1)}
                  </StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="lg" />

            {/* Payment Information */}
            <StandardText
              fontWeight="bold"
              size="md"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Payment Information
            </StandardText>
            <Gap size="sm" />
            <StandardCard
              style={[styles.infoCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={20}
                  color={colors.secondary}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Payment Method
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.paymentMethod}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={colors.secondary}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Due Date
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {new Date(expense.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </StandardText>
                </View>
              </View>

              {expense.date && (
                <>
                  <Divider style={styles.rowDivider} />
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={20}
                      color={colors.secondary}
                    />
                    <View style={styles.infoContent}>
                      <StandardText size="xs" style={{ color: textSecondary }}>
                        Payment Date
                      </StandardText>
                      <StandardText
                        fontWeight="medium"
                        size="md"
                        style={{ color: textPrimary }}
                      >
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </StandardText>
                    </View>
                  </View>
                </>
              )}
            </StandardCard>

            {/* Description */}
            {expense.description && (
              <>
                <Gap size="lg" />
                <StandardText
                  fontWeight="bold"
                  size="md"
                  style={[styles.sectionTitle, { color: textPrimary }]}
                >
                  Description
                </StandardText>
                <Gap size="sm" />
                <StandardCard
                  style={[
                    styles.descriptionCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <StandardText
                    size="sm"
                    style={{ color: textPrimary, lineHeight: 20 }}
                  >
                    {expense.description}
                  </StandardText>
                </StandardCard>
              </>
            )}

            <Gap size="xl" />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleShareInvoice}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
              icon="share-variant"
            >
              Share
            </Button>

            {expense.status === 'pending' || expense.status === 'overdue' ? (
              <Button
                mode="contained"
                onPress={handleMarkAsPaid}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.success },
                ]}
                labelStyle={{ color: colors.white }}
                icon="check"
              >
                Mark Paid
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={handleEditExpense}
                style={[styles.actionButton, { borderColor: colors.secondary }]}
                labelStyle={{ color: colors.secondary }}
                icon="pencil"
              >
                Edit
              </Button>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteExpense}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    marginHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
    maxHeight: 500,
  },
  amountCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  amountSection: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 36,
    marginVertical: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  rowDivider: {
    marginVertical: 8,
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpenseDetailModal;
