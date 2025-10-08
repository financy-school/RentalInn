import React, { useState, useRef, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme, ProgressBar } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import GradientCard from '../components/GradientCard/GradientCard';
import StyledButton from '../components/StyledButton/StyledButton';
import LinearGradient from 'react-native-linear-gradient';

const { height } = Dimensions.get('window');

const AppTutorial = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tutorialSteps = [
    {
      id: 1,
      title: '🏠 Welcome to RentalInn',
      subtitle: 'Your Complete Property Management Solution',
      content:
        "RentalInn helps property owners manage rooms, tenants, maintenance, and finances all in one place. Let's take a tour of the key features!",
      image: '🏢',
      tips: [
        'Manage multiple properties effortlessly',
        'Track rental income and expenses',
        'Handle tenant communications',
        'Monitor property maintenance',
      ],
      action: "Let's Get Started",
    },
    {
      id: 2,
      title: '🏠 Room Management',
      subtitle: 'Add and Manage Your Properties',
      content:
        'Create detailed room profiles with photos, amenities, rent details, and availability status. Perfect for showcasing your properties to potential tenants.',
      image: '🏠',
      tips: [
        'Add up to 10 photos per room',
        'Set rent amount and security deposit',
        'Track electricity readings',
        'List amenities and room features',
        'Mark rooms as available or occupied',
      ],
      action: 'Continue',
      navigation: 'Go to Property Management → Add New Room',
    },
    {
      id: 3,
      title: '👥 Tenant Management',
      subtitle: 'Handle Tenant Information & Agreements',
      content:
        'Store complete tenant details, track agreement periods, manage check-in/check-out dates, and maintain rental history.',
      image: '👥',
      tips: [
        'Store personal details and documents',
        'Set lock-in and agreement periods',
        'Track rent start and end dates',
        'Categorize as family or bachelor tenants',
        'Maintain tenant history records',
      ],
      action: 'Continue',
      navigation: 'Go to Tenant Management → Add New Tenant',
    },
    {
      id: 4,
      title: '🎫 Support & Maintenance',
      subtitle: 'Handle Issues and Maintenance Requests',
      content:
        'Create support tickets for property issues, track resolution status, and maintain a history of all maintenance activities.',
      image: '🔧',
      tips: [
        'Report maintenance issues with photos',
        'Track ticket status and progress',
        'Categorize different types of issues',
        'Maintain maintenance history',
        'Schedule preventive maintenance',
      ],
      action: 'Continue',
      navigation: 'Go to Support & Maintenance → Create Ticket',
    },
    {
      id: 5,
      title: '💰 Financial Management',
      subtitle: 'Track Payments and Generate Reports',
      content:
        'Monitor rental payments, track expenses, generate financial reports, and maintain complete records for tax purposes.',
      image: '💰',
      tips: [
        'Track rental income and payments',
        'Monitor pending dues',
        'Generate revenue reports',
        'Track property expenses',
        'Export data for accounting',
      ],
      action: 'Continue',
      navigation: 'Go to Financial Reports → Revenue Overview',
    },
    {
      id: 6,
      title: '📋 KYC & Documentation',
      subtitle: 'Secure Document Management',
      content:
        'Store tenant documents securely, maintain KYC records, and ensure compliance with legal requirements.',
      image: '📋',
      tips: [
        'Upload and store tenant documents',
        'Maintain ID proof and address proof',
        'Store rental agreements digitally',
        'Keep emergency contact information',
        'Ensure data privacy and security',
      ],
      action: 'Continue',
      navigation: 'Go to KYC Documents',
    },
    {
      id: 7,
      title: '🎯 Pro Tips for Success',
      subtitle: 'Make the Most of RentalInn',
      content:
        'Here are some expert tips to help you maximize your property management efficiency and tenant satisfaction.',
      image: '💡',
      tips: [
        'Take high-quality photos of rooms',
        'Respond to maintenance requests quickly',
        'Keep tenant documents up-to-date',
        'Use analytics to optimize rent pricing',
        'Maintain regular communication with tenants',
        'Back up your data regularly',
      ],
      action: 'Continue',
    },
    {
      id: 8,
      title: "🎉 You're All Set!",
      subtitle: 'Ready to Manage Your Properties',
      content:
        'Congratulations! You now know how to use all the key features of RentalInn. Start adding your properties and tenants to get the most out of the app.',
      image: '🚀',
      tips: [
        'Add your first property',
        'Upload tenant information',
        'Explore the dashboard for insights',
        'Set up notifications for important events',
        'Contact support if you need help',
      ],
      action: 'Start Using RentalInn',
      isLast: true,
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      // Smooth fade out animation with easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Update step after fade out completes
        setCurrentStep(currentStep + 1);
        // Reset scroll position immediately
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });

        // Fade in with new content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Tutorial completed
      navigation.goBack();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Smooth fade out animation with easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Update step after fade out completes
        setCurrentStep(currentStep - 1);
        // Reset scroll position immediately
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });

        // Fade in with new content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const skipTutorial = () => {
    navigation.goBack();
  };

  const goToStep = stepIndex => {
    if (
      stepIndex >= 0 &&
      stepIndex < tutorialSteps.length &&
      stepIndex !== currentStep
    ) {
      // Smooth fade out animation with easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        // Update step after fade out completes
        setCurrentStep(stepIndex);
        // Reset scroll position immediately
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });

        // Fade in with new content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const currentTutorial = tutorialSteps[currentStep];
  const progress = (currentStep + 1) / tutorialSteps.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12, // Reduced padding
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      color: theme.colors.primary,
    },
    skipButton: {
      color: theme.colors.onSurfaceVariant,
    },
    progressContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12, // Reduced padding
    },
    progressText: {
      textAlign: 'center',
      marginBottom: 8,
      color: theme.colors.onSurfaceVariant,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
    },
    contentContainer: {
      padding: 20,
      paddingTop: 10,
      minHeight: height - 250, // Increased to ensure content fits
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 24, // Reduced margin
      paddingTop: 10, // Add padding to prevent cutting
    },
    imageText: {
      fontSize: 72, // Slightly smaller to prevent cutting
      marginBottom: 12, // Reduced margin
      textAlign: 'center',
    },
    gradientTitle: {
      paddingHorizontal: 20, // Reduced padding
      paddingVertical: 10, // Reduced padding
      borderRadius: 16, // Slightly smaller border radius
      alignItems: 'center',
      marginTop: 8, // Add margin to prevent overlap
    },
    titleText: {
      color: theme.colors.onPrimary,
      textAlign: 'center',
    },
    subtitleText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 6, // Reduced margin
      marginBottom: 20, // Reduced margin
    },
    contentCard: {
      marginBottom: 24,
    },
    contentText: {
      lineHeight: 24,
      textAlign: 'center',
      color: theme.colors.onSurface,
      marginBottom: 24,
    },
    tipsContainer: {
      marginBottom: 24,
    },
    tipsTitle: {
      color: theme.colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    tipBullet: {
      color: theme.colors.primary,
      marginRight: 12,
      marginTop: 2,
    },
    tipText: {
      flex: 1,
      lineHeight: 20,
      color: theme.colors.onSurface,
    },
    navigationHint: {
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      alignItems: 'center',
    },
    navigationHintText: {
      color: theme.colors.primary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    bottomContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navButton: {
      minWidth: 100,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 3,
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
    },
    stepDotInactive: {
      backgroundColor: theme.colors.outline,
    },
    stepNumber: {
      color: theme.colors.primary,
      marginHorizontal: 8,
    },
    progressBarStyle: {
      height: 4,
      borderRadius: 2,
    },
    stepNumberContainer: {
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <StandardHeader
        navigation={navigation}
        title="App Tutorial"
        rightComponent={
          <TouchableOpacity onPress={skipTutorial}>
            <StandardText style={styles.skipButton}>Skip</StandardText>
          </TouchableOpacity>
        }
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <StandardText size="sm" style={styles.progressText}>
          Step {currentStep + 1} of {tutorialSteps.length}
        </StandardText>
        <ProgressBar
          progress={progress}
          color={theme.colors.primary}
          style={styles.progressBarStyle}
        />
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false} // Disable bounce for smoother experience
        overScrollMode="never" // Android: prevent overscroll
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          {/* Image/Icon */}
          <View style={styles.imageContainer}>
            {/* <StandardText style={styles.imageText}>
              {currentTutorial.image}
            </StandardText> */}
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primary]}
              style={styles.gradientTitle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <StandardText
                size="xl"
                fontWeight="bold"
                style={styles.titleText}
              >
                {currentTutorial.title}
              </StandardText>
            </LinearGradient>
          </View>

          <StandardText size="lg" fontWeight="500" style={styles.subtitleText}>
            {currentTutorial.subtitle}
          </StandardText>

          {/* Content Card */}
          <GradientCard style={styles.contentCard}>
            <StandardText style={styles.contentText}>
              {currentTutorial.content}
            </StandardText>

            {/* Navigation Hint */}
            {currentTutorial.navigation && (
              <View style={styles.navigationHint}>
                <StandardText
                  size="sm"
                  fontWeight="600"
                  style={styles.navigationHintText}
                >
                  💡 Quick Access: {currentTutorial.navigation}
                </StandardText>
              </View>
            )}

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <StandardText size="lg" fontWeight="600" style={styles.tipsTitle}>
                {currentTutorial.isLast ? 'Next Steps:' : 'Key Features:'}
              </StandardText>
              {currentTutorial.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <StandardText style={styles.tipBullet}>•</StandardText>
                  <StandardText style={styles.tipText}>{tip}</StandardText>
                </View>
              ))}
            </View>
          </GradientCard>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Step Indicators */}
        <View style={styles.stepIndicatorContainer}>
          {tutorialSteps.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToStep(index)}
              style={[
                styles.stepDot,
                index === currentStep
                  ? styles.stepDotActive
                  : styles.stepDotInactive,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <StyledButton
            mode="outlined"
            onPress={prevStep}
            disabled={currentStep === 0}
            style={styles.navButton}
            title={<StandardText>Previous</StandardText>}
          />

          <View style={styles.stepNumberContainer}>
            <StandardText size="sm" style={styles.stepNumber}>
              {currentStep + 1} / {tutorialSteps.length}
            </StandardText>
          </View>

          <StyledButton
            mode="contained"
            onPress={nextStep}
            style={styles.navButton}
            title={<StandardText>{currentTutorial.action}</StandardText>}
          />
        </View>
      </View>
    </View>
  );
};

export default AppTutorial;
