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

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state
  const [formData, setFormData] = useState({
    firstName: credentials?.firstName || '',
    lastName: credentials?.lastName || '',
    email: credentials?.email || '',
    phone: credentials?.phone || '',
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
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

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="Edit Profile" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        {/* <Card style={[styles.avatarCard, { backgroundColor: cardBackground }]}>
          <View style={styles.avatarSection}>
            <Avatar.Image
              size={100}
              source={{
                uri: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=EE7B11&color=fff`,
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
        </Card> */}

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
              label="First Name"
              value={formData.firstName}
              onChangeText={value => handleInputChange('firstName', value)}
              error={errors.firstName}
              placeholder="Enter your first name"
              leftIcon="account-outline"
            />

            <Gap size="md" />

            <StyledTextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={value => handleInputChange('lastName', value)}
              error={errors.lastName}
              placeholder="Enter your last name"
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
              maxLength={10}
            />
          </View>
        </Card>

        <Gap size="lg" />

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
