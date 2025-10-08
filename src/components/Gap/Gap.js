import { View, StyleSheet } from 'react-native';
import React from 'react';
import { SPACING } from '../../theme/layout';

const Gap = ({ size = 'md' }) => {
  return <View style={gap[size]} />;
};

export default Gap;

const gap = StyleSheet.create({
  xs: {
    height: SPACING.xs,
    width: SPACING.xs,
  },
  sm: {
    height: SPACING.sm,
    width: SPACING.sm,
  },
  md: {
    height: SPACING.md,
    width: SPACING.md,
  },
  lg: {
    height: SPACING.lg,
    width: SPACING.lg,
  },
  xl: {
    height: SPACING.xl,
    width: SPACING.xl,
  },
  xxl: {
    height: SPACING.xxl,
    width: SPACING.xxl,
  },
  xxxl: {
    height: SPACING.xxxl,
    width: SPACING.xxxl,
  },
});
