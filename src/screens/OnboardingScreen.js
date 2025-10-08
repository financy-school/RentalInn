import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../components/StandardText/StandardText';
import colors from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ONBOARDING_STORAGE_KEY = 'hasSeenOnboarding';

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to RentalInn',
    subtitle: 'Your Property Management Solution',
    description:
      'Manage your rental properties, tenants, and payments all in one place. Simplify your property management experience.',
    icon: 'home-city',
    backgroundColor: ['#001C68', '#003399'],
    iconColor: '#ffffff',
  },
  {
    id: '2',
    title: 'Manage Tenants',
    subtitle: 'Keep Track of Everyone',
    description:
      'Add tenant details, track their payments, manage lease agreements, and maintain all important documents securely.',
    icon: 'account-group',
    backgroundColor: ['#EE7B11', '#FFA500'],
    iconColor: '#ffffff',
  },
  {
    id: '3',
    title: 'Track Payments',
    subtitle: 'Never Miss a Payment',
    description:
      'Record payments, send reminders, track due dates, and maintain complete payment history for all your tenants.',
    icon: 'cash-multiple',
    backgroundColor: ['#001C68', '#EE7B11'],
    iconColor: '#ffffff',
  },
  {
    id: '4',
    title: 'Property Analytics',
    subtitle: 'Insights at Your Fingertips',
    description:
      'Get detailed analytics about your properties, rental income, occupancy rates, and financial performance.',
    icon: 'chart-line',
    backgroundColor: ['#EE7B11', '#001C68'],
    iconColor: '#ffffff',
  },
  {
    id: '5',
    title: 'Get Started',
    subtitle: 'Ready to Begin?',
    description:
      'Start managing your rental properties like a pro. Create your account and begin your property management journey.',
    icon: 'rocket-launch',
    backgroundColor: ['#003399', '#0047AB'],
    iconColor: '#ffffff',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      // Navigate to Login and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: event => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentIndex(index);
      },
    },
  );

  const renderOnboardingItem = ({ item, index }) => (
    <LinearGradient
      colors={item.backgroundColor}
      style={styles.slide}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={item.icon}
            size={120}
            color={item.iconColor}
            style={styles.icon}
          />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <StandardText fontWeight="bold" style={styles.title}>
            {item.title}
          </StandardText>

          <StandardText fontWeight="medium" style={styles.subtitle}>
            {item.subtitle}
          </StandardText>

          <StandardText style={styles.description}>
            {item.description}
          </StandardText>
        </View>
      </View>
    </LinearGradient>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {onboardingData.map((_, index) => {
        const inputRange = [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: colors.white,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Skip Button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <StandardText style={styles.skipText}>Skip</StandardText>
        </TouchableOpacity>
      )}

      {/* Onboarding Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        style={styles.flatList}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dots Indicator */}
        {renderDots()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              currentIndex > 0
                ? styles.activeNavButton
                : styles.inactiveNavButton,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* Next/Get Started Button */}
          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.nextButton, { backgroundColor: colors.white }]}
            labelStyle={[
              styles.nextButtonText,
              {
                color:
                  onboardingData[currentIndex]?.backgroundColor[0] ||
                  colors.primary,
              },
            ]}
            contentStyle={styles.nextButtonContent}
          >
            {currentIndex === onboardingData.length - 1
              ? 'Get Started'
              : 'Next'}
          </Button>

          {/* Next Arrow Button */}
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextArrowButton]}
              onPress={handleNext}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white + '20',
  },
  skipText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 150,
  },
  iconContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: 300,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previousButton: {
    // Additional styles if needed
  },
  activeNavButton: {
    opacity: 1,
    backgroundColor: colors.white + '20',
  },
  inactiveNavButton: {
    opacity: 0.3,
    backgroundColor: colors.white + '20',
  },
  nextArrowButton: {
    backgroundColor: colors.white + '20',
  },
  nextButton: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  nextButtonContent: {
    paddingVertical: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Metropolis-Bold',
  },
});

export { ONBOARDING_STORAGE_KEY };
export default OnboardingScreen;
