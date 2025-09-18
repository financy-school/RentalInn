import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import Gap from '../components/Gap/Gap';
import StandardText from '../components/StandardText/StandardText';
import GradientCard from '../components/GradientCard/GradientCard';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import StyledButton from '../components/StyledButton/StyledButton';
import AnimatedChip from '../components/AnimatedChip/AnimatedChip';
import { addTenant, updateTenant } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTenant = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const { credentials } = useContext(CredentialsContext);

  // Check if in edit mode
  const params = route?.params;
  const isEdit = params && params.isEdit;
  const editTenant = params && params.tenant;
  console.log('Edit Tenant:', isEdit, editTenant);

  // Set navigation header title based on mode
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: isEdit ? 'Edit Tenant' : 'Add Tenant',
        headerTitleStyle: {
          fontFamily: 'Metropolis-Medium',
          fontSize: 18,
          fontWeight: '600',
        },
      });
    }, [navigation, isEdit]),
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [datePicker, setDatePicker] = useState({
    field: '',
    show: false,
    value: new Date(),
  });

  const openDatePicker = field => {
    setDatePicker({
      field,
      show: true,
      value: tenant[field] ? new Date(tenant[field]) : new Date(),
    });
  };

  const formatDate = date => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setTenant({
        ...tenant,
        [datePicker.field]: formatDate(selectedDate),
      });
    }
    setDatePicker({ ...datePicker, show: false });
  };

  const [tenant, setTenant] = useState({
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    lockInPeriod: '',
    agreementPeriod: '',
    tenantType: '',
    addRentOn: '',
  });

  // Populate form when in edit mode
  useEffect(() => {
    if (isEdit && editTenant) {
      setTenant({
        name: editTenant.name || '',
        phone: editTenant.phone || '',
        alternatePhone: editTenant.alternate_phone || '',
        email: editTenant.email || '',
        roomId: editTenant.room_id || editTenant.room?.id || '',
        checkInDate: editTenant.check_in_date || '',
        checkOutDate: editTenant.check_out_date || '',
        lockInPeriod: editTenant.lock_in_period?.toString() || '',
        agreementPeriod: editTenant.agreement_period?.toString() || '',
        tenantType: editTenant.tenant_type || '',
        addRentOn: editTenant.add_rent_on || '',
      });
    }
  }, [isEdit, editTenant]);

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!tenant.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!tenant.phone.trim() || tenant.phone.length !== 10) {
      errors.phone = 'Valid phone is required';
    }
    if (!tenant.email.trim() || !tenant.email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    if (!tenant.roomId.trim()) {
      errors.roomId = 'Room ID is required';
    }
    if (!tenant.checkInDate.trim()) {
      errors.checkInDate = 'Check-in date is required';
    }
    if (!tenant.checkOutDate.trim()) {
      errors.checkOutDate = 'Check-out date is required';
    }
    if (!tenant.lockInPeriod.trim() || isNaN(tenant.lockInPeriod)) {
      errors.lockInPeriod = 'Lock-in period is required';
    }
    if (!tenant.agreementPeriod.trim() || isNaN(tenant.agreementPeriod)) {
      errors.agreementPeriod = 'Agreement period is required';
    }
    if (!tenant.tenantType.trim()) {
      errors.tenantType = 'Tenant type is required';
    }
    if (!tenant.addRentOn.trim()) {
      errors.addRentOn = 'Rent start date is required';
    }
    return errors;
  };

  const handleChange = (key, value) => {
    setTenant({ ...tenant, [key]: value });
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg('Please fill all mandatory fields correctly.');
      return;
    }

    submitTenant();
  };

  const submitTenant = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (isEdit) {
        await updateTenant(credentials.accessToken, editTenant.id, tenant);
      } else {
        await addTenant(
          credentials.accessToken,
          credentials.property_id,
          tenant,
        );
      }
      navigation.goBack({ refresh: true });
    } catch (error) {
      setErrorMsg(
        error?.message ||
          (typeof error === 'string'
            ? error
            : `Failed to ${
                isEdit ? 'update' : 'add'
              } tenant. Please try again.`),
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (errorMsg) return theme.colors.errorContainer;
    return theme.colors.surfaceVariant;
  };

  const getStatusTextColor = () => {
    if (errorMsg) return theme.colors.onErrorContainer;
    return theme.colors.onSurfaceVariant;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      paddingTop: 10,
    },

    headerContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    gradientTitle: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: 'center',
    },
    formSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      marginBottom: 12,
      color: '#007AFF',
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    formColumn: {
      flex: 1,
    },
    fieldLabel: {
      marginBottom: 8,
      color: '#424242',
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginVertical: 8,
    },
    chip: {
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
      borderWidth: 1,
      borderColor: mode === 'dark' ? '#404040' : '#e0e0e0',
      borderRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      color: mode === 'dark' ? '#ffffff' : '#333333',
      fontFamily: 'Metropolis-Medium',
      fontSize: 14,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    errorText: {
      color: '#D32F2F',
      marginTop: 4,
      fontSize: 12,
    },
    statusContainer: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    statusText: {
      textAlign: 'center',
    },
    submitContainer: {
      marginTop: 24,
      gap: 12,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GradientCard
        gradient={true}
        gradientColors={[
          mode === 'dark' ? '#2a2a2a' : '#ffffff',
          mode === 'dark' ? '#1f1f1f' : '#f8f9fa',
        ]}
      >
        {/* Personal Information Section */}
        <View style={styles.formSection}>
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            📋 Personal Information
          </StandardText>

          <StyledTextInput
            label="Full Name *"
            value={tenant.name}
            onChangeText={text => handleChange('name', text)}
            placeholder="Enter tenant's full name"
            left={<PaperInput.Icon icon="account" />}
            error={formErrors.name}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Phone Number *"
                value={tenant.phone}
                onChangeText={text => handleChange('phone', text)}
                placeholder="Primary phone number"
                keyboardType="phone-pad"
                maxLength={10}
                left={<PaperInput.Icon icon="phone" />}
                error={formErrors.phone}
              />
            </View>

            <View style={styles.formColumn}>
              <StyledTextInput
                label="Alternate Phone"
                value={tenant.alternatePhone}
                onChangeText={text => handleChange('alternatePhone', text)}
                placeholder="Alternate number"
                keyboardType="phone-pad"
                maxLength={10}
                left={<PaperInput.Icon icon="phone-plus" />}
              />
            </View>
          </View>

          <StyledTextInput
            label="Email Address *"
            value={tenant.email}
            onChangeText={text => handleChange('email', text)}
            placeholder="Tenant's email address"
            keyboardType="email-address"
            left={<PaperInput.Icon icon="email" />}
            error={formErrors.email}
          />
        </View>

        {/* Room & Agreement Section */}
        <View style={styles.formSection}>
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            🏠 Room & Agreement Details
          </StandardText>

          <StyledTextInput
            label="Room ID *"
            value={tenant.roomId}
            onChangeText={text => handleChange('roomId', text)}
            placeholder="Room ID or number"
            left={<PaperInput.Icon icon="door" />}
            error={formErrors.roomId}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <TouchableOpacity onPress={() => openDatePicker('checkInDate')}>
                <StyledTextInput
                  label="Check-in Date *"
                  value={tenant.checkInDate}
                  placeholder="Select check-in date"
                  left={<PaperInput.Icon icon="calendar-import" />}
                  error={formErrors.checkInDate}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formColumn}>
              <TouchableOpacity onPress={() => openDatePicker('checkOutDate')}>
                <StyledTextInput
                  label="Check-out Date *"
                  value={tenant.checkOutDate}
                  placeholder="Select check-out date"
                  left={<PaperInput.Icon icon="calendar-export" />}
                  error={formErrors.checkOutDate}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Lock-in Period (months) *"
                value={tenant.lockInPeriod}
                onChangeText={text => handleChange('lockInPeriod', text)}
                placeholder="e.g. 6"
                keyboardType="numeric"
                left={<PaperInput.Icon icon="lock" />}
                error={formErrors.lockInPeriod}
              />
            </View>

            <View style={styles.formColumn}>
              <StyledTextInput
                label="Agreement Period (months) *"
                value={tenant.agreementPeriod}
                onChangeText={text => handleChange('agreementPeriod', text)}
                placeholder="e.g. 12"
                keyboardType="numeric"
                left={<PaperInput.Icon icon="file-document" />}
                error={formErrors.agreementPeriod}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <StandardText size="sm" fontWeight="600" style={styles.fieldLabel}>
              Tenant Type *
            </StandardText>
            <View style={styles.chipContainer}>
              <AnimatedChip
                label="Family"
                selected={tenant.tenantType === 'family'}
                onPress={() => handleChange('tenantType', 'family')}
                size="medium"
                icon="home-heart"
                style={[
                  styles.chip,
                  tenant.tenantType === 'family' && styles.chipSelected,
                ]}
                textStyle={[
                  styles.chipText,
                  tenant.tenantType === 'family' && styles.chipTextSelected,
                ]}
              />
              <AnimatedChip
                label="Bachelors"
                selected={tenant.tenantType === 'bachelors'}
                onPress={() => handleChange('tenantType', 'bachelors')}
                size="medium"
                icon="account-group"
                style={[
                  styles.chip,
                  tenant.tenantType === 'bachelors' && styles.chipSelected,
                ]}
                textStyle={[
                  styles.chipText,
                  tenant.tenantType === 'bachelors' && styles.chipTextSelected,
                ]}
              />
            </View>
            {formErrors.tenantType && (
              <StandardText size="xs" style={styles.errorText}>
                {formErrors.tenantType}
              </StandardText>
            )}
          </View>

          <TouchableOpacity onPress={() => openDatePicker('addRentOn')}>
            <StyledTextInput
              label="Rent Start Date *"
              value={tenant.addRentOn}
              placeholder="Select rent start date"
              left={<PaperInput.Icon icon="currency-inr" />}
              error={formErrors.addRentOn}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>

        {/* Status Messages */}
        {errorMsg && (
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: getStatusColor() },
            ]}
          >
            <StandardText
              size="md"
              fontWeight="600"
              style={[styles.statusText, { color: getStatusTextColor() }]}
            >
              ❌ {errorMsg}
            </StandardText>
          </View>
        )}

        {/* Submit Buttons */}
        <View style={styles.submitContainer}>
          <StyledButton
            title={
              loading
                ? isEdit
                  ? 'Updating Tenant...'
                  : 'Adding Tenant...'
                : isEdit
                ? 'Update Tenant'
                : 'Add Tenant'
            }
            icon={
              loading ? 'loading' : isEdit ? 'account-edit' : 'account-plus'
            }
            variant="primary"
            size="large"
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
            fullWidth={true}
          />

          <StyledButton
            title="Cancel"
            icon="close"
            variant="outlined"
            size="medium"
            onPress={() => navigation.goBack()}
            disabled={loading}
            fullWidth={true}
          />
        </View>
      </GradientCard>

      {/* Date Picker */}
      {datePicker.show && (
        <DateTimePicker
          value={datePicker.value}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Gap size="lg" />
    </ScrollView>
  );
};

export default AddTenant;
