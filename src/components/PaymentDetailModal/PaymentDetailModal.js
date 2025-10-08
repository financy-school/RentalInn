import React, { useContext } from 'react';
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
import colors from '../../theme/colors';

const PaymentDetailModal = ({ visible, payment, onDismiss, theme }) => {
  const isDark = theme === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const modalBackground = isDark ? colors.backgroundDark : colors.white;

  if (!payment) return null;

  const getStatusColor = status => {
    switch (status) {
      case 'received':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleShareReceipt = async () => {
    try {
      const receiptText = `
PAYMENT RECEIPT
${payment.receiptNumber}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tenant: ${payment.tenantName}
Property: ${payment.propertyName}

Amount: ₹${payment.amount.toLocaleString()}
Category: ${payment.category}
Payment Method: ${payment.paymentMethod}
${payment.transactionId ? `Transaction ID: ${payment.transactionId}` : ''}

Due Date: ${payment.dueDate}
Payment Date: ${payment.date || 'Not Paid'}
Status: ${payment.status.toUpperCase()}

Description: ${payment.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your payment!
      `.trim();

      await Share.open({
        title: 'Share Receipt',
        message: receiptText,
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing receipt:', error);
        Alert.alert('Error', 'Failed to share receipt');
      }
    }
  };

  const handleMarkAsReceived = () => {
    Alert.alert(
      'Mark as Received',
      'Are you sure you want to mark this payment as received?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Implement API call
            Alert.alert('Success', 'Payment marked as received');
            onDismiss();
          },
        },
      ],
    );
  };

  const handleSendReminder = () => {
    Alert.alert(
      'Send Reminder',
      `Send payment reminder to ${payment.tenantName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // TODO: Implement API call
            Alert.alert('Success', 'Reminder sent successfully');
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
                  { backgroundColor: getStatusColor(payment.status) + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    payment.status === 'received'
                      ? 'check-circle'
                      : payment.status === 'overdue'
                      ? 'alert-circle'
                      : 'clock-outline'
                  }
                  size={32}
                  color={getStatusColor(payment.status)}
                />
              </View>
              <View style={styles.headerText}>
                <StandardText
                  fontWeight="bold"
                  size="xl"
                  style={{ color: textPrimary }}
                >
                  Payment Details
                </StandardText>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  {payment.receiptNumber}
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
                  Amount
                </StandardText>
                <StandardText
                  fontWeight="bold"
                  style={[
                    styles.amount,
                    { color: getStatusColor(payment.status) },
                  ]}
                >
                  ₹{payment.amount.toLocaleString()}
                </StandardText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(payment.status) + '20' },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="sm"
                    style={{ color: getStatusColor(payment.status) }}
                  >
                    {payment.status.toUpperCase()}
                  </StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="lg" />

            {/* Tenant Information */}
            <StandardText
              fontWeight="bold"
              size="md"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Tenant Information
            </StandardText>
            <Gap size="sm" />
            <StandardCard
              style={[styles.infoCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Tenant Name
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {payment.tenantName}
                  </StandardText>
                </View>
              </View>

              {payment.tenantPhone && (
                <>
                  <Divider style={styles.rowDivider} />
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="phone"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.infoContent}>
                      <StandardText size="xs" style={{ color: textSecondary }}>
                        Contact Number
                      </StandardText>
                      <StandardText
                        fontWeight="medium"
                        size="md"
                        style={{ color: textPrimary }}
                      >
                        {payment.tenantPhone}
                      </StandardText>
                    </View>
                  </View>
                </>
              )}

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home"
                  size={20}
                  color={colors.primary}
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
                    {payment.propertyName}
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
                  name="tag"
                  size={20}
                  color={colors.secondary}
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
                    {payment.category.charAt(0).toUpperCase() +
                      payment.category.slice(1)}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
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
                    {payment.paymentMethod}
                  </StandardText>
                </View>
              </View>

              {payment.transactionId && (
                <>
                  <Divider style={styles.rowDivider} />
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="identifier"
                      size={20}
                      color={colors.secondary}
                    />
                    <View style={styles.infoContent}>
                      <StandardText size="xs" style={{ color: textSecondary }}>
                        Transaction ID
                      </StandardText>
                      <StandardText
                        fontWeight="medium"
                        size="sm"
                        style={{ color: textPrimary }}
                      >
                        {payment.transactionId}
                      </StandardText>
                    </View>
                  </View>
                </>
              )}

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
                    {new Date(payment.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </StandardText>
                </View>
              </View>

              {payment.date && (
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
                        {new Date(payment.date).toLocaleDateString('en-IN', {
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
            {payment.description && (
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
                    {payment.description}
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
              onPress={handleShareReceipt}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
              icon="share-variant"
            >
              Share
            </Button>

            {payment.status === 'pending' || payment.status === 'overdue' ? (
              <>
                <Button
                  mode="outlined"
                  onPress={handleSendReminder}
                  style={[styles.actionButton, { borderColor: colors.warning }]}
                  labelStyle={{ color: colors.warning }}
                  icon="bell"
                >
                  Remind
                </Button>
                <Button
                  mode="contained"
                  onPress={handleMarkAsReceived}
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.success },
                  ]}
                  labelStyle={{ color: colors.white }}
                  icon="check"
                >
                  Mark Received
                </Button>
              </>
            ) : null}
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
  },
  actionButton: {
    flex: 1,
  },
});

export default PaymentDetailModal;
