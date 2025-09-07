import React from 'react';
import {ScrollView, View} from 'react-native';
import {Text, IconButton, useTheme} from 'react-native-paper';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/color';

const iconsData = [
  {icon: 'contacts', label: 'Contacts'},
  {icon: 'account-plus', label: 'Add Tenant'},
  {icon: 'bullhorn', label: 'Announce'},
  {icon: 'credit-card', label: 'Payments'},
  {icon: 'home-plus', label: 'Add Room'},
];

const CircularIconsWithText = ({onActionPress}) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{paddingHorizontal: 15}}>
      {iconsData.map((item, index) => (
        <View key={index} style={{alignItems: 'center', marginRight: 18}}>
          {/* Circular Icon with Border */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 35,
              backgroundColor: colors.white,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.light_black,
              shadowColor: colors.light_black,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
            <IconButton
              icon={item.icon}
              iconColor={colors.onPrimaryContainer}
              size={20}
              onPress={() => onActionPress(item)}
            />
          </View>

          <StandardText textAlign="center" size="sm" style={{flex: 1}}>
            {item.label}
          </StandardText>
        </View>
      ))}
    </ScrollView>
  );
};

export default CircularIconsWithText;
