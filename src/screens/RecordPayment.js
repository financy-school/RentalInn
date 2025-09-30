import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Button, Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import { recordPayment, getTenant } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const RecordPayment = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant_id } = route.params || {};

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state
  const [formData, setFormData] = useState({
    collectedAmount: '',
    paymentDate: new Date(),
    paymentMode: '',
    description: '',
    adjustFromDeposit: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch tenant details
  useEffect(() => {
    const fetchTenantDetails = async () => {
      setLoadingTenant(true);
      try {
        const response = await getTenant(credentials.accessToken, tenant_id);
        if (response.success) {
          setTenantData(response.data);
        } else {
          Alert.alert('Error', 'Failed to fetch tenant details');
        }
      } catch (error) {
        console.error('Error fetching tenant:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while fetching tenant details',
        );
      } finally {
        setLoadingTenant(false);
      }
    };

    if (tenant_id) {
      fetchTenantDetails();
    }
  }, [tenant_id, credentials.accessToken]);

  // Payment modes with icons
  const paymentModes = [
    { id: 'cash', name: 'Cash', icon: 'cash' },
    { id: 'gpay', name: 'GPay', icon: 'google' },
    { id: 'phonepe', name: 'Phone Pe', icon: 'phone' },
    { id: 'paytm', name: 'Paytm', icon: 'wallet' },
    { id: 'upi', name: 'UPI', icon: 'bank-transfer' },
    { id: 'other', name: 'Other', icon: 'credit-card' },
  ];

  const formatDate = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateForDisplay = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice();
    return `${day}-${month}-${year}`;
  };

  // Map payment mode IDs to API-friendly format
  const mapPaymentMode = paymentModeId => {
    const modeMap = {
      cash: 'Cash',
      gpay: 'GPay',
      phonepe: 'PhonePe',
      paytm: 'Paytm',
      upi: 'UPI',
      other: 'Other',
    };
    return modeMap[paymentModeId] || paymentModeId;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, paymentDate: selectedDate });
    }
  };

  const handlePaymentModeSelect = selectedMode => {
    setFormData({ ...formData, paymentMode: selectedMode });
    setErrors({ ...errors, paymentMode: null });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.collectedAmount.trim()) {
      newErrors.collectedAmount = 'Amount is required';
    } else if (
      isNaN(formData.collectedAmount) ||
      parseFloat(formData.collectedAmount) <= 0
    ) {
      newErrors.collectedAmount = 'Enter a valid amount';
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = 'Please select a payment mode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare payment data according to API format
      const paymentPayload = {
        invoice_id:
          tenantData?.invoices?.[0]?.invoice_id || tenantData?.tenant_id,
        amount: parseFloat(formData.collectedAmount),
        paymentDate: formData.paymentDate.toISOString(),
        paymentMethod: mapPaymentMode(formData.paymentMode),
        transactionId: `TXN${Date.now()}`, // Generate a transaction ID
        notes: formData.description || 'Payment recorded via mobile app',
      };

      const response = await recordPayment(
        credentials.accessToken,
        paymentPayload,
      );

      if (response.success) {
        Alert.alert('Success', 'Payment recorded successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          response.error || 'Failed to record payment. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StandardHeader
        navigation={navigation}
        title="Record Payment"
        loading={loading}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Tenant Info Card */}
        <Card style={[styles.tenantCard, { backgroundColor: cardBackground }]}>
          {loadingTenant ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <StandardText
                style={[styles.loadingText, { color: textSecondary }]}
              >
                Loading tenant details...
              </StandardText>
            </View>
          ) : (
            <View style={styles.tenantHeader}>
              <View style={styles.tenantInfo}>
                <StandardText
                  fontWeight="bold"
                  style={[styles.tenantName, { color: textPrimary }]}
                >
                  {tenantData?.name || 'N/A'}
                </StandardText>
                <View style={styles.tenantDetails}>
                  <MaterialCommunityIcons
                    name="home"
                    size={16}
                    color={textSecondary}
                    style={styles.roomIcon}
                  />
                  <StandardText
                    style={[styles.roomText, { color: textSecondary }]}
                  >
                    {tenantData?.room?.name || 'N/A'}
                  </StandardText>
                </View>
              </View>
              <View style={styles.amountContainer}>
                <StandardText
                  fontWeight="bold"
                  style={[styles.rentAmount, { color: colors.primary }]}
                >
                  ₹{parseFloat(tenantData?.rent_amount || 0).toLocaleString()}
                </StandardText>
                <StandardText
                  style={[styles.nextDueDate, { color: textSecondary }]}
                >
                  {tenantData?.invoices?.[0]?.due_date
                    ? formatDate(new Date(tenantData.invoices[0].due_date))
                    : 'N/A'}
                </StandardText>
              </View>
            </View>
          )}
        </Card>

        <Gap size="lg" />

        {/* Payment Form */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          {/* Collected Amount */}
          <View style={styles.inputContainer}>
            <StyledTextInput
              label="Collected Amount"
              value={formData.collectedAmount}
              onChangeText={text => {
                setFormData({ ...formData, collectedAmount: text });
                setErrors({ ...errors, collectedAmount: null });
              }}
              keyboardType="numeric"
              placeholder="Ex: 1000"
              error={errors.collectedAmount}
              style={styles.amountInput}
            />
          </View>

          <Gap size="md" />

          {/* Payment Date */}
          <View style={styles.inputContainer}>
            <StandardText
              fontWeight="600"
              style={[styles.inputLabel, { color: textPrimary }]}
            >
              Payment Date
            </StandardText>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: isDark
                    ? colors.backgroundDark
                    : colors.white,
                  borderColor: isDark
                    ? colors.light_gray
                    : colors.textSecondary,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={textSecondary}
                style={styles.dateIcon}
              />
              <StandardText style={[styles.dateText, { color: textPrimary }]}>
                {formatDateForDisplay(formData.paymentDate)}
              </StandardText>
            </TouchableOpacity>
          </View>

          <Gap size="md" />

          {/* Payment Mode */}
          <View style={styles.inputContainer}>
            <StandardText
              fontWeight="600"
              style={[styles.inputLabel, { color: textPrimary }]}
            >
              Payment Mode
            </StandardText>
            {errors.paymentMode && (
              <StandardText style={[styles.errorText, { color: colors.error }]}>
                {errors.paymentMode}
              </StandardText>
            )}
            <View style={styles.paymentModesContainer}>
              {paymentModes.map(paymentMode => (
                <TouchableOpacity
                  key={paymentMode.id}
                  style={[
                    styles.paymentModeItem,
                    {
                      backgroundColor:
                        formData.paymentMode === paymentMode.id
                          ? colors.primary + '15'
                          : isDark
                          ? colors.backgroundDark
                          : colors.white,
                      borderColor:
                        formData.paymentMode === paymentMode.id
                          ? colors.primary
                          : isDark
                          ? colors.light_gray
                          : '#E0E0E0',
                    },
                  ]}
                  onPress={() => handlePaymentModeSelect(paymentMode.id)}
                >
                  <MaterialCommunityIcons
                    name={paymentMode.icon}
                    size={24}
                    color={
                      formData.paymentMode === paymentMode.id
                        ? colors.primary
                        : textSecondary
                    }
                    style={styles.paymentModeIcon}
                  />
                  <StandardText
                    style={[
                      styles.paymentModeText,
                      {
                        color:
                          formData.paymentMode === paymentMode.id
                            ? colors.primary
                            : textPrimary,
                      },
                    ]}
                  >
                    {paymentMode.name}
                  </StandardText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Gap size="md" />

          {/* Description */}
          <View style={styles.inputContainer}>
            <StyledTextInput
              label="Description (Optional)"
              value={formData.description}
              onChangeText={text =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Type description..."
              multiline
              numberOfLines={3}
              style={styles.descriptionInput}
            />
          </View>

          <Gap size="md" />

          {/* Adjust from Deposit */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() =>
              setFormData({
                ...formData,
                adjustFromDeposit: !formData.adjustFromDeposit,
              })
            }
          >
            <Checkbox
              status={formData.adjustFromDeposit ? 'checked' : 'unchecked'}
              onPress={() =>
                setFormData({
                  ...formData,
                  adjustFromDeposit: !formData.adjustFromDeposit,
                })
              }
              color={colors.primary}
            />
            <View style={styles.checkboxTextContainer}>
              <StandardText
                style={[styles.checkboxText, { color: textPrimary }]}
              >
                Adjust this dues from deposit
              </StandardText>
              <StandardText
                style={[styles.depositInfo, { color: colors.error }]}
              >
                Available Deposit: ₹
                {parseFloat(
                  tenantData?.rentals?.[0]?.securityDeposit || 0,
                ).toLocaleString()}
              </StandardText>
            </View>
          </TouchableOpacity>
        </Card>

        <Gap size="xl" />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          labelStyle={[styles.submitButtonText, { color: colors.white }]}
        >
          Record Payment
        </Button>

        <Gap size="xxl" />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.paymentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
  },
  placeholder: {
    width: 32,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tenantCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    marginBottom: 4,
  },
  tenantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomIcon: {
    marginRight: 4,
  },
  roomText: {
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  rentAmount: {
    fontSize: 18,
    marginBottom: 2,
  },
  nextDueDate: {
    fontSize: 12,
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  paymentModesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  paymentModeItem: {
    flex: 1,

    minWidth: (screenWidth - 100) / 3,
    maxWidth: (screenWidth - 100) / 3,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentModeIcon: {
    marginBottom: 6,
  },
  paymentModeText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  checkboxText: {
    fontSize: 14,
    marginBottom: 2,
  },
  depositInfo: {
    fontSize: 12,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default RecordPayment;
