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
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    type: 'Residential', // Residential, Commercial, Mixed
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

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
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
      const newProperty = await addProperty(formData);

      Alert.alert(
        'Success',
        `Property "${newProperty.name}" has been added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add property. Please try again.');
      console.error('Add property error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Property type options
  const propertyTypes = [
    { label: 'Residential', value: 'Residential', icon: 'home' },
    { label: 'Commercial', value: 'Commercial', icon: 'office-building' },
    { label: 'Mixed Use', value: 'Mixed', icon: 'domain' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
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

            <StyledTextInput
              label="Description"
              value={formData.description}
              onChangeText={value => handleInputChange('description', value)}
              error={errors.description}
              placeholder="Brief description of the property (optional)"
              leftIcon="text-outline"
              multiline
              numberOfLines={3}
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
                    {
                      backgroundColor:
                        formData.type === type.value
                          ? colors.primary + '20'
                          : cardBackground,
                      borderColor:
                        formData.type === type.value
                          ? colors.primary
                          : colors.border,
                    },
                    formData.type === type.value
                      ? styles.selectedTypeCard
                      : styles.unselectedTypeCard,
                  ]}
                  onPress={() => handleInputChange('type', type.value)}
                >
                  <View style={styles.typeContent}>
                    <MaterialCommunityIcons
                      name={type.icon}
                      size={24}
                      color={
                        formData.type === type.value
                          ? colors.primary
                          : textSecondary
                      }
                    />
                    <StandardText
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            formData.type === type.value
                              ? colors.primary
                              : textSecondary,
                        },
                      ]}
                      fontWeight={
                        formData.type === type.value ? 'bold' : 'medium'
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

            <StyledTextInput
              label="PIN Code"
              value={formData.pincode}
              onChangeText={value => handleInputChange('pincode', value)}
              error={errors.pincode}
              placeholder="Enter 6-digit PIN code"
              leftIcon="mailbox-outline"
              keyboardType="numeric"
              maxLength={6}
            />
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
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formCard: {
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
});

export default AddProperty;
