import {View, StyleSheet} from 'react-native';
import React from 'react';

const Gap = ({size}) => {
  return <View style={gap[size]} />;
};

export default Gap;

const gap = StyleSheet.create({
  xs: {
    height: 8,
    width: 8,
  },
  sm: {
    height: 14,
    width: 14,
  },
  md: {
    height: 16,
    width: 16,
  },
  lg: {
    height: 24,
    width: 24,
  },
  xl: {
    height: 30,
    width: 30,
  },
  xxl: {
    height: 32,
    width: 32,
  },
});
