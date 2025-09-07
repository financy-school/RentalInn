import React, { useState, useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { TextInput as PaperInput, useTheme, Card } from 'react-native-paper';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import GradientCard from '../components/GradientCard/GradientCard';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import StyledButton from '../components/StyledButton/StyledButton';
import AnimatedChip from '../components/AnimatedChip/AnimatedChip';
import Gap from '../components/Gap/Gap';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const ContactSupport = ({ navigation }) => {
  const theme = useTheme();
  const { storedCredentials } = useContext(CredentialsContext);

  const [formData, setFormData] = useState({
    name: storedCredentials?.name || '',
    email: storedCredentials?.email || '',
    phone: storedCredentials?.phone || '',
    subject: '',
    category: '',
    priority: 'Medium',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { label: 'Technical Issue', icon: 'bug', color: '#FF6B6B' },
    { label: 'Account Problem', icon: 'account-alert', color: '#4ECDC4' },
    { label: 'Feature Request', icon: 'lightbulb', color: '#45B7D1' },
    { label: 'Billing Question', icon: 'credit-card', color: '#96CEB4' },
    { label: 'Property Management', icon: 'home', color: '#FFEAA7' },
    { label: 'Other', icon: 'help-circle', color: '#DDA0DD' },
  ];

  const priorities = [
    { label: 'Low', color: '#95E1D3', description: 'General inquiry' },
    { label: 'Medium', color: '#F8C291', description: 'Standard support' },
    {
      label: 'High',
      color: '#FF8A80',
      description: 'Urgent assistance needed',
    },
    {
      label: 'Critical',
      color: '#FF5722',
      description: 'System down/blocking issue',
    },
  ];

  const quickActions = [
    {
      title: 'Call Support',
      subtitle: '+91-9628283375 (24/7)',
      icon: 'phone',
      color: '#4CAF50',
      action: () => Linking.openURL('tel:+919628283375'),
    },
    // {
    //   title: 'Live Chat',
    //   subtitle: 'Instant messaging support',
    //   icon: 'chat',
    //   color: '#2196F3',
    //   action: () => {
    //     Alert.alert(
    //       'Live Chat',
    //       'Live chat will be available soon! For now, please use the contact form below or call our support line.',
    //       [{ text: 'OK' }],
    //     );
    //   },
    // },
    {
      title: 'Email Support',
      subtitle: 'support@rentalinn.com',
      icon: 'email',
      color: '#FF9800',
      action: () => Linking.openURL('mailto:support@rentalinn.com'),
    },
    // {
    //   title: 'Video Call',
    //   subtitle: 'Schedule a screen share',
    //   icon: 'video',
    //   color: '#9C27B0',
    //   action: () => {
    //     Alert.alert(
    //       'Video Call Support',
    //       'Video support sessions can be scheduled by calling our support line or submitting a request below.',
    //       [{ text: 'OK' }],
    //     );
    //   },
    // },
  ];

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

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Support Request Submitted! 🎉',
        `Thank you ${
          formData.name
        }! We've received your ${formData.priority.toLowerCase()} priority request about "${
          formData.subject
        }". Our team will respond within 24 hours to ${formData.email}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: storedCredentials?.name || '',
                email: storedCredentials?.email || '',
                phone: storedCredentials?.phone || '',
                subject: '',
                category: '',
                priority: 'Medium',
                message: '',
              });
              setErrors({});
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        'Failed to submit your request. Please try again or contact us directly.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    gradientTitle: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: 'center',
    },
    sectionTitle: {
      color: theme.colors.primary,
      marginBottom: 16,
      marginTop: 8,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    quickActionCard: {
      width: '48%',
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
    },
    quickActionContent: {
      padding: 16,
      alignItems: 'center',
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionTitle: {
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 4,
    },
    quickActionSubtitle: {
      color: '#FFFFFF',
      opacity: 0.9,
      textAlign: 'center',
    },
    formSection: {
      marginBottom: 24,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    categoryChip: {
      width: '48%',
      marginBottom: 8,
    },
    priorityContainer: {
      marginBottom: 16,
    },
    priorityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    priorityItem: {
      width: '48%',
      marginBottom: 8,
    },
    priorityCard: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    priorityCardSelected: {
      borderColor: theme.colors.primary,
    },
    priorityLabel: {
      textAlign: 'center',
      marginBottom: 4,
    },
    priorityDescription: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
    messageInput: {
      minHeight: 120,
    },
    submitButton: {
      marginTop: 16,
      color: theme.colors.onPrimary,
    },
    supportInfoCard: {
      marginBottom: 24,
      padding: 16,
    },
    supportInfoText: {
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    responseTimeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
    },
    responseTimeItem: {
      alignItems: 'center',
    },
    responseTimeNumber: {
      color: theme.colors.primary,
      marginBottom: 4,
    },
    responseTimeLabel: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.error,
      marginTop: 4,
    },
    priorityWhiteText: {
      color: '#FFFFFF',
    },
    priorityWhiteTextWithOpacity: {
      color: '#FFFFFF',
      opacity: 0.9,
    },
  });

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.gradientTitle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <StandardText
            size="xl"
            fontWeight="bold"
            style={{ color: theme.colors.onPrimary }}
          >
            🆘 Contact Support
          </StandardText>
        </LinearGradient>
      </View>

      {/* Support Info */}
      <Card style={styles.supportInfoCard}>
        <StandardText style={styles.supportInfoText}>
          Our support team is here to help you 24/7. Choose from multiple ways
          to get assistance or fill out the form below for detailed support.
        </StandardText>
        <View style={styles.responseTimeContainer}>
          <View style={styles.responseTimeItem}>
            <StandardText
              size="lg"
              fontWeight="bold"
              style={styles.responseTimeNumber}
            >
              &lt; 1hr
            </StandardText>
            <StandardText size="sm" style={styles.responseTimeLabel}>
              Phone Support
            </StandardText>
          </View>
          <View style={styles.responseTimeItem}>
            <StandardText
              size="lg"
              fontWeight="bold"
              style={styles.responseTimeNumber}
            >
              &lt; 24hrs
            </StandardText>
            <StandardText size="sm" style={styles.responseTimeLabel}>
              Email Response
            </StandardText>
          </View>
          <View style={styles.responseTimeItem}>
            <StandardText
              size="lg"
              fontWeight="bold"
              style={styles.responseTimeNumber}
            >
              99.9%
            </StandardText>
            <StandardText size="sm" style={styles.responseTimeLabel}>
              Satisfaction Rate
            </StandardText>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
        Quick Contact Options
      </StandardText>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionCard}
            onPress={action.action}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[action.color, `${action.color}CC`]}
              style={styles.quickActionContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <PaperInput.Icon
                icon={action.icon}
                size={25}
                color="#FFFFFF"
                style={styles.quickActionIcon}
              />
              <StandardText
                size="md"
                fontWeight="600"
                style={styles.quickActionTitle}
              >
                {action.title}
              </StandardText>
              <StandardText size="sm" style={styles.quickActionSubtitle}>
                {action.subtitle}
              </StandardText>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Support Form */}
      <GradientCard style={styles.formSection}>
        <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
          Submit Support Request
        </StandardText>
        {/* Personal Information */}
        <StyledTextInput
          label="Full Name"
          value={formData.name}
          onChangeText={value => updateFormData('name', value)}
          error={errors.name}
          left={<PaperInput.Icon icon="account" />}
        />
        <Gap size="md" />
        <StyledTextInput
          label="Email Address"
          value={formData.email}
          onChangeText={value => updateFormData('email', value)}
          error={errors.email}
          keyboardType="email-address"
          left={<PaperInput.Icon icon="email" />}
        />
        <Gap size="md" />
        <StyledTextInput
          label="Phone Number (Optional)"
          value={formData.phone}
          onChangeText={value => updateFormData('phone', value)}
          keyboardType="phone-pad"
          left={<PaperInput.Icon icon="phone" />}
        />
        <Gap size="md" />
        <StyledTextInput
          label="Subject"
          value={formData.subject}
          onChangeText={value => updateFormData('subject', value)}
          error={errors.subject}
          placeholder="Brief description of your issue"
          left={<PaperInput.Icon icon="text-subject" />}
        />
        <Gap size="lg" />
        {/* Category Selection */}
        <StandardText size="md" fontWeight="600" style={styles.sectionTitle}>
          Issue Category{' '}
          {errors.category && (
            <StandardText style={{ color: theme.colors.error }}>*</StandardText>
          )}
        </StandardText>
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryChip}>
              <AnimatedChip
                label={category.label}
                selected={formData.category === category.label}
                onPress={() => updateFormData('category', category.label)}
                icon={category.icon}
                style={{
                  backgroundColor:
                    formData.category === category.label
                      ? category.color
                      : undefined,
                }}
              />
            </View>
          ))}
        </View>
        {errors.category && (
          <StandardText style={styles.errorText}>
            {errors.category}
          </StandardText>
        )}
        <Gap size="lg" />
        {/* Priority Selection */}
        <View style={styles.priorityContainer}>
          <StandardText size="md" fontWeight="600" style={styles.sectionTitle}>
            Priority Level
          </StandardText>
          <View style={styles.priorityGrid}>
            {priorities.map((priority, index) => (
              <TouchableOpacity
                key={index}
                style={styles.priorityItem}
                onPress={() => updateFormData('priority', priority.label)}
              >
                <View
                  style={[
                    styles.priorityCard,
                    { backgroundColor: priority.color },
                    formData.priority === priority.label &&
                      styles.priorityCardSelected,
                  ]}
                >
                  <StandardText
                    size="md"
                    fontWeight="600"
                    style={[styles.priorityLabel, styles.priorityWhiteText]}
                  >
                    {priority.label}
                  </StandardText>
                  <StandardText
                    size="sm"
                    style={[
                      styles.priorityDescription,
                      styles.priorityWhiteTextWithOpacity,
                    ]}
                  >
                    {priority.description}
                  </StandardText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Gap size="lg" />
        {/* Message */}
        <StyledTextInput
          label="Detailed Message"
          value={formData.message}
          onChangeText={value => updateFormData('message', value)}
          error={errors.message}
          multiline
          numberOfLines={6}
          placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
          style={styles.messageInput}
          left={<PaperInput.Icon icon="message-text" />}
        />
        <Gap size="lg" />
        <StyledButton
          title={
            isSubmitting ? 'Submitting Request...' : 'Submit Support Request'
          }
          icon="send"
          loading={isSubmitting}
          disabled={isSubmitting}
          mode="contained"
          size="medium"
          onPress={handleSubmit}
          fullWidth={true}
          style={styles.submitButton}
        />
      </GradientCard>

      <Gap size="lg" />
    </ScrollView>
  );
};

export default ContactSupport;
