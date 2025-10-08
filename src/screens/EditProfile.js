import React, { useContext, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Button, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import colors from '../theme/colors';

const EditProfile = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials, setCredentials } = useContext(CredentialsContext);

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
    name: credentials?.name || '',
    email: credentials?.email || '',
    phone: credentials?.phone || '',
    propertyName: credentials?.propertyName || '',
    address: credentials?.address || '',
    city: credentials?.city || '',
    state: credentials?.state || '',
    pincode: credentials?.pincode || '',
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
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.propertyName.trim()) {
      newErrors.propertyName = 'Property name is required';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update credentials
      setCredentials(prev => ({
        ...prev,
        ...formData,
      }));

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar change
  const handleAvatarChange = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      { text: 'Camera', onPress: () => console.log('Camera selected') },
      { text: 'Gallery', onPress: () => console.log('Gallery selected') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="Edit Profile" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <Card style={[styles.avatarCard, { backgroundColor: cardBackground }]}>
          <View style={styles.avatarSection}>
            <Avatar.Image
              size={100}
              source={{
                uri: `https://ui-avatars.com/api/?name=${formData.name}&background=EE7B11&color=fff`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.avatarChangeButton}
              onPress={handleAvatarChange}
            >
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
          <StandardText
            style={[styles.avatarText, { color: textSecondary }]}
            fontWeight="medium"
          >
            Tap to change profile picture
          </StandardText>
        </Card>

        <Gap size="lg" />

        {/* Personal Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Personal Information
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Full Name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              placeholder="Enter your full name"
              leftIcon="account-outline"
            />

            <Gap size="md" />

            <StyledTextInput
              label="Email Address"
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              error={errors.email}
              placeholder="Enter your email"
              leftIcon="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Gap size="md" />

            <StyledTextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={value => handleInputChange('phone', value)}
              error={errors.phone}
              placeholder="Enter your phone number"
              leftIcon="phone-outline"
              keyboardType="phone-pad"
            />
          </View>
        </Card>

        <Gap size="lg" />

        {/* Property Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="home-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Property Information
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Property Name"
              value={formData.propertyName}
              onChangeText={value => handleInputChange('propertyName', value)}
              error={errors.propertyName}
              placeholder="Enter property name"
              leftIcon="home-outline"
            />

            <Gap size="md" />

            <StyledTextInput
              label="Address"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              error={errors.address}
              placeholder="Enter property address"
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
              placeholder="Enter PIN code"
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </View>

        <Gap size="xxl" />
      </ScrollView>
    </View>
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
  avatarCard: {
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarChangeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 14,
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

export default EditProfile;
