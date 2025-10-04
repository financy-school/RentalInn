import React, { useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/color';

const AnimatedLoader = ({
  message = 'Loading...',
  icon = 'loading',
  size = 48,
  color,
  fullScreen = true,
  showMessage = true,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = colors.background;
  const loaderColor = color || colors.primary;
  const textColor = isDark ? colors.white : colors.textPrimary;

  useEffect(() => {
    // Spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Scale animation (pulse effect)
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, [spinValue, scaleValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, { backgroundColor }]
    : styles.inlineContainer;

  return (
    <View style={containerStyle}>
      <Animatable.View
        animation="fadeIn"
        duration={300}
        style={styles.contentContainer}
      >
        {/* Animated spinning icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: scaleValue }],
            },
          ]}
        >
          <MaterialCommunityIcons name={icon} size={size} color={loaderColor} />
        </Animated.View>

        {/* Loading dots animation */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map(index => (
            <Animatable.View
              key={index}
              animation="pulse"
              duration={1000}
              delay={index * 200}
              iterationCount="infinite"
              style={[styles.dot, { backgroundColor: loaderColor }]}
            />
          ))}
        </View>

        {/* Loading message */}
        {showMessage && (
          <Animatable.View animation="fadeIn" delay={300} duration={500}>
            <StandardText
              fontSize={14}
              fontWeight="medium"
              style={[styles.loadingText, { color: textColor }]}
            >
              {message}
            </StandardText>
          </Animatable.View>
        )}
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AnimatedLoader;
