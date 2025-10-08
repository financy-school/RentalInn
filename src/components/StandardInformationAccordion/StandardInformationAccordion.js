import { View, StyleSheet, TouchableHighlight } from 'react-native';
import React, { useState } from 'react';
import StandardCard from '../StandardCard/StandardCard';
import StandardText from '../StandardText/StandardText';
import Gap from '../Gap/Gap';
import StandardSvg from '../StandardSvg/StandardSvg';
import { fadedColorOpacity, hexToRgba, getColor } from '../../theme/colors';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from 'react-native-paper';

const AnimatedBtn = Animated.createAnimatedComponent(TouchableHighlight);
const AnimatedView = Animated.createAnimatedComponent(View);

const StandardInformationAccordion = ({ heading, icon, content }) => {
  const { colors } = useTheme();

  const [expanded, setExpanded] = useState(false);
  const [measured, setMeasured] = useState(false);

  const contentHeight = useSharedValue(0);
  const expandHeight = useSharedValue(0);
  const rotate = useSharedValue(0); // numeric degrees

  const toggleAccordion = () => {
    setExpanded(prev => {
      const next = !prev;
      rotate.value = withTiming(next ? 180 : 0, { duration: 300 });
      expandHeight.value = withTiming(next ? contentHeight.value : 0, {
        duration: 300,
      });
      return next;
    });
  };

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  // ✅ use maxHeight so text won't get clipped
  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value,
    overflow: 'hidden',
  }));

  const onContentLayout = event => {
    const height = event.nativeEvent.layout.height;
    if (!measured && height > 0) {
      contentHeight.value = height + 8; // ✅ add buffer
      setMeasured(true);
    }
  };

  return (
    <View>
      <StandardCard>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headingContainer}>
            {icon && (
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name={icon}
                  size={25}
                  color={colors.onSurface}
                />
              </View>
            )}
            <StandardText fontWeight="semibold" size="lg" color="default_gray">
              {heading}
            </StandardText>
          </View>

          <AnimatedBtn
            underlayColor={hexToRgba(
              colors.primary ?? getColor('default_red'),
              fadedColorOpacity,
            )}
            onPress={toggleAccordion}
            style={styles.dropDownIcon}
          >
            <Animated.View style={rotateStyle}>
              <StandardSvg
                icon="arrow-down-drop-circle"
                size="sm"
                color={colors.primary}
              />
            </Animated.View>
          </AnimatedBtn>
        </View>

        {/* Animated Content */}
        <AnimatedView style={[expandStyle, styles.animatedContent]}>
          <View style={{ paddingBottom: 8 }}>
            <Gap size="sm" />
            {content}
          </View>
        </AnimatedView>

        {/* Hidden Measurer */}
        {!measured && (
          <View style={styles.hiddenMeasure} onLayout={onContentLayout}>
            {content}
          </View>
        )}
      </StandardCard>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    marginRight: 8,
  },
  dropDownIcon: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
  },
  animatedContent: {
    overflow: 'hidden',
  },
});

export default StandardInformationAccordion;
