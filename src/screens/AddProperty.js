import React, { useContext, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { useProperty } from '../context/PropertyContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import colors from '../theme/color';

const AddProperty = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { addProperty } = useProperty();

  // Theme variables
  const isDark = mode === 'dark';

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state - Updated to match CreatePropertyDto
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '', // Updated from pincode to match DTO
    country: 'India', // Default country
    totalArea: '',
    yearBuilt: '',
    propertyType: 'Residential', // Updated field name to match DTO
    isParkingAvailable: false,
    isElevatorAvailable: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Optional fields validation with proper formatting
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    if (
      formData.totalArea &&
      (isNaN(formData.totalArea) || parseFloat(formData.totalArea) <= 0)
    ) {
      newErrors.totalArea = 'Please enter a valid area in square feet';
    }

    if (
      formData.yearBuilt &&
      (isNaN(formData.yearBuilt) ||
        parseInt(formData.yearBuilt, 10) < 1800 ||
        parseInt(formData.yearBuilt, 10) > new Date().getFullYear())
    ) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format data to match API expectations
      const propertyData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        country: formData.country.trim() || undefined,

        totalArea: formData.totalArea
          ? parseFloat(formData.totalArea)
          : undefined,
        yearBuilt: formData.yearBuilt
          ? parseInt(formData.yearBuilt, 10)
          : undefined,
        propertyType: formData.propertyType || undefined,
        isParkingAvailable: formData.isParkingAvailable,
        isElevatorAvailable: formData.isElevatorAvailable,
      };

      // Remove undefined values to avoid sending empty fields
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      const newProperty = await addProperty(propertyData);

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to add property. Please try again.',
      );
      console.error('Add property error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Property type options - Updated to match common property types
  const propertyTypes = [
    { label: 'Residential', value: 'Residential', icon: 'home' },
    { label: 'Commercial', value: 'Commercial', icon: 'office-building' },
    { label: 'Industrial', value: 'Industrial', icon: 'factory' },
    // { label: 'Mixed Use', value: 'Mixed Use', icon: 'domain' },
    // { label: 'Retail', value: 'Retail', icon: 'store' },
    // { label: 'Office', value: 'Office', icon: 'briefcase' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StandardHeader navigation={navigation} title="Add Property" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Property Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="home-plus-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Property Details
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Property Name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              placeholder="Enter property name"
              leftIcon="home-outline"
            />

            <Gap size="md" />

            {/* Property Type Selection */}
            <StandardText
              style={[styles.fieldLabel, { color: textPrimary }]}
              fontWeight="medium"
            >
              Property Type
            </StandardText>

            <Gap size="sm" />

            <View style={styles.typeContainer}>
              {propertyTypes.map(type => (
                <Card
                  key={type.value}
                  style={[
                    styles.typeCard,

                    formData.propertyType === type.value
                      ? styles.selectedTypeCard
                      : styles.unselectedTypeCard,
                  ]}
                  onPress={() => handleInputChange('propertyType', type.value)}
                >
                  <View style={styles.typeContent}>
                    <MaterialCommunityIcons
                      name={type.icon}
                      size={24}
                      color={
                        formData.propertyType === type.value
                          ? colors.primary
                          : textSecondary
                      }
                    />
                    <StandardText
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            formData.propertyType === type.value
                              ? colors.primary
                              : textSecondary,
                        },
                      ]}
                      fontWeight={
                        formData.propertyType === type.value ? 'bold' : 'medium'
                      }
                    >
                      {type.label}
                    </StandardText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Address Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Address Information
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Full Address"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              error={errors.address}
              placeholder="Enter complete address"
              leftIcon="map-marker-outline"
              multiline
              numberOfLines={2}
            />

            <Gap size="md" />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="City"
                  value={formData.city}
                  onChangeText={value => handleInputChange('city', value)}
                  error={errors.city}
                  placeholder="City"
                  leftIcon="city-variant-outline"
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="State"
                  value={formData.state}
                  onChangeText={value => handleInputChange('state', value)}
                  error={errors.state}
                  placeholder="State"
                  leftIcon="map-outline"
                />
              </View>
            </View>

            <Gap size="md" />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Postal Code"
                  value={formData.postalCode}
                  onChangeText={value => handleInputChange('postalCode', value)}
                  error={errors.postalCode}
                  placeholder="PIN code"
                  leftIcon="mailbox-outline"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Country"
                  value={formData.country}
                  onChangeText={value => handleInputChange('country', value)}
                  error={errors.country}
                  placeholder="Country"
                  leftIcon="flag-outline"
                />
              </View>
            </View>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Property Details */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Additional Details
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Total Area (sq ft)"
                  value={formData.totalArea}
                  onChangeText={value => handleInputChange('totalArea', value)}
                  error={errors.totalArea}
                  placeholder="Area in sq ft"
                  leftIcon="ruler-square"
                  keyboardType="numeric"
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Year Built"
                  value={formData.yearBuilt}
                  onChangeText={value => handleInputChange('yearBuilt', value)}
                  error={errors.yearBuilt}
                  placeholder="e.g., 2020"
                  leftIcon="calendar-outline"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <Gap size="md" />

            {/* Amenities */}
            <StandardText
              style={[styles.fieldLabel, { color: textPrimary }]}
              fontWeight="medium"
            >
              Available Amenities
            </StandardText>

            <Gap size="sm" />

            <View style={styles.amenityContainer}>
              <Card
                style={[styles.amenityCard]}
                onPress={() =>
                  handleInputChange(
                    'isParkingAvailable',
                    !formData.isParkingAvailable,
                  )
                }
              >
                <View style={styles.amenityContent}>
                  <MaterialCommunityIcons
                    name="car"
                    size={20}
                    color={
                      formData.isParkingAvailable
                        ? colors.primary
                        : textSecondary
                    }
                  />
                  <StandardText
                    style={[
                      styles.amenityLabel,
                      {
                        color: formData.isParkingAvailable
                          ? colors.primary
                          : textSecondary,
                      },
                    ]}
                    fontWeight={formData.isParkingAvailable ? 'bold' : 'medium'}
                  >
                    Parking
                  </StandardText>
                </View>
              </Card>

              <Card
                style={[styles.amenityCard]}
                onPress={() =>
                  handleInputChange(
                    'isElevatorAvailable',
                    !formData.isElevatorAvailable,
                  )
                }
              >
                <View style={styles.amenityContent}>
                  <MaterialCommunityIcons
                    name="elevator"
                    size={20}
                    color={
                      formData.isElevatorAvailable
                        ? colors.primary
                        : textSecondary
                    }
                  />
                  <StandardText
                    style={[
                      styles.amenityLabel,
                      {
                        color: formData.isElevatorAvailable
                          ? colors.primary
                          : textSecondary,
                      },
                    ]}
                    fontWeight={
                      formData.isElevatorAvailable ? 'bold' : 'medium'
                    }
                  >
                    Elevator
                  </StandardText>
                </View>
              </Card>
            </View>
          </View>
        </Card>

        <Gap size="xl" />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            style={[styles.button, styles.cancelButton]}
            labelStyle={[styles.buttonLabel, { color: textSecondary }]}
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            style={[styles.button, styles.saveButton]}
            labelStyle={[styles.buttonLabel, { color: colors.white }]}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Property'}
          </Button>
        </View>

        <Gap size="xxl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    borderRadius: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: colors.white,
    minWidth: 90,
    borderColor: colors.white,
  },
  selectedTypeCard: {
    borderWidth: 1,
  },
  unselectedTypeCard: {
    borderWidth: 1,
  },
  typeContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  typeLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  cancelButton: {
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'Metropolis-Medium',
  },
  amenityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityCard: {
    borderRadius: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    minWidth: 100,
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  amenityContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  amenityLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AddProperty;
