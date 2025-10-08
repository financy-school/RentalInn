import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import colors from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({
  onAnimationComplete,
  showLoadingText = true,
  customMessage = 'Loading your data...',
}) => {
  const { theme: mode } = useContext(ThemeContext);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const dotBounce = useRef(new Animated.Value(0)).current;

  // Determine theme colors
  const backgroundColor = colors.secondary;

  const textColor =
    mode === 'dark'
      ? colors.white || '#ffffff'
      : colors.textPrimary || colors.black || '#000000';

  useEffect(() => {
    // Set status bar style based on theme
    StatusBar.setBarStyle(
      mode === 'dark' ? 'light-content' : 'dark-content',
      true,
    );

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor, true);
    }

    // Start animations sequence
    const animationSequence = Animated.sequence([
      // Initial fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Double pulsing animation - gradually increase then decrease (twice for effect)
      Animated.sequence([
        // First pulse
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Second pulse (slightly bigger)
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),

      // Show loading text and start dot animation
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Continuous bouncing dots
        Animated.loop(
          Animated.sequence([
            Animated.timing(dotBounce, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotBounce, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]),
    ]);

    animationSequence.start(() => {
      // Callback when animation completes
      onAnimationComplete?.();
    });

    // Cleanup function
    return () => {
      // Reset status bar on unmount
      StatusBar.setBarStyle('default', true);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent', true);
      }
    };
  }, [
    fadeAnim,
    scaleAnim,
    slideAnim,
    pulseAnim,
    loadingOpacity,
    dotBounce,
    backgroundColor,
    mode,
    onAnimationComplete,
  ]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />

      {/* Main logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/rentalinn-without-bg.png')}
          style={styles.image}
          resizeMode="contain"
          // Performance optimizations
          fadeDuration={0}
          loadingIndicatorSource={require('../assets/rentalinn-without-bg.png')}
        />
      </Animated.View>

      {/* Loading text */}
      {showLoadingText && (
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingOpacity,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <StandardText
            style={[styles.loadingText, { color: textColor }]}
            fontWeight="medium"
          >
            {customMessage}
          </StandardText>

          {/* Loading indicator dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map(index => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: textColor,
                    opacity: loadingOpacity,
                    transform: [
                      {
                        translateY: dotBounce.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
                          extrapolate: 'clamp',
                        }),
                      },
                      {
                        scale: dotBounce.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.3, 1],
                          extrapolate: 'clamp',
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Background pattern (optional) */}
      <View style={styles.backgroundPattern}>
        <Image
          source={require('../assets/rentalinn-without-bg.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: Math.min(width * 0.6, 250),
    height: Math.min(width * 0.6, 250),
    maxWidth: 300,
    maxHeight: 300,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
    minHeight: 60,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  backgroundPattern: {
    position: 'absolute',
    top: height * 0.1,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    zIndex: -1,
    opacity: 0.05,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
