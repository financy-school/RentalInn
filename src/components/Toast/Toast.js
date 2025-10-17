import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';
import { RADIUS, SHADOW } from '../../theme/layout';

const { width } = Dimensions.get('window');

const Toast = ({ message, type = 'info', visible, onHide, duration = 3000 }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: 'check-circle',
          iconColor: colors.white,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: 'alert-circle',
          iconColor: colors.white,
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: 'alert',
          iconColor: colors.white,
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info,
          icon: 'information',
          iconColor: colors.white,
        };
    }
  };

  if (!visible) return null;

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.iconColor}
          style={styles.icon}
        />
        <StandardText
          style={styles.message}
          numberOfLines={3}
          fontWeight="medium"
        >
          {message}
        </StandardText>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: RADIUS.medium,
    ...SHADOW.strong,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Toast;
