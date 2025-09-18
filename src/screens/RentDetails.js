import React, { useCallback, useContext, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Text,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CircularIconsWithText from '../components/cards/CircularIcon';
import { ThemeContext } from '../context/ThemeContext';

import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import colors from '../theme/color';

const RentDetails = ({ navigation }) => {
  const { theme: mode, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const [selectedAction, setSelectedAction] = useState(null);

  const bottomSheetModalRef = useRef(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const handleQuickActionPress = useCallback(action => {
    setSelectedAction(action);
    bottomSheetModalRef.current?.present();
  }, []);

  const roomWiseStats = [
    {
      label: 'Room 1',
      value: '12,000',
    },
    {
      label: 'Room 2',
      value: '10,000',
    },
    {
      label: 'Room 3',
      value: '8,000',
    },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 15,
      }}
    >
      <ScrollView>
        <Gap size="xl" />

        <Gap size="lg" />
        <StandardCard
          style={{
            elevation: 2,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 10,
                alignItems: 'center',
              }}
            >
              <StandardText
                textAlign="center"
                size="md"
                fontWeight="bold"
                style={{ flex: 1 }}
              >
                Room Type
              </StandardText>
              <StandardText
                textAlign="center"
                size="md"
                fontWeight="bold"
                style={{ flex: 1 }}
              >
                Rent
              </StandardText>
            </View>
            {roomWiseStats.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginVertical: 10,
                  alignItems: 'center',
                }}
              >
                <StandardText
                  textAlign="center"
                  size="md"
                  fontWeight="bold"
                  style={{ flex: 1 }}
                >
                  {item.label}
                </StandardText>
                <StandardText
                  textAlign="center"
                  size="md"
                  fontWeight="bold"
                  style={{ flex: 1 }}
                >
                  ₹ {item.value}
                </StandardText>
              </View>
            ))}

            <View>
              <Button
                mode="contained"
                buttonColor={colors.black}
                style={{
                  width: '45%',
                  alignSelf: 'center',
                  marginTop: 10,
                  marginBottom: 10,
                  borderRadius: 5,
                }}
                onPress={() => {
                  navigation.navigate('Settings');
                }}
              >
                EDIT
              </Button>
            </View>
          </View>
        </StandardCard>

        <Gap size="lg" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StandardCard style={{ flex: 1, elevation: 2 }}>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 10,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <StandardText textAlign="center" size="md" fontWeight="bold">
                Paid
              </StandardText>

              <View style={{ marginVertical: 10 }}>
                <StandardText textAlign="center" size="xl" fontWeight="bold">
                  124
                </StandardText>
                <StandardText
                  textAlign="center"
                  size="md"
                  style={{ marginTop: 4 }}
                >
                  Tenants
                </StandardText>
              </View>

              <Button
                mode="contained"
                buttonColor={colors.white}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                style={{
                  borderRadius: 5,
                  borderColor: colors.black,
                  borderWidth: 1,
                }}
                onPress={() => {}}
              >
                <StandardText textAlign="center" size="md" style={{ flex: 1 }}>
                  VIEW
                </StandardText>
              </Button>
            </View>
          </StandardCard>

          <StandardCard style={{ flex: 1, elevation: 2 }}>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 10,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <StandardText textAlign="center" size="md" fontWeight="bold">
                Not-Paid
              </StandardText>

              <View style={{ marginVertical: 10 }}>
                <StandardText
                  textAlign="center"
                  size="xl"
                  fontWeight="bold"
                  color={'default_red'}
                >
                  124
                </StandardText>
                <StandardText
                  textAlign="center"
                  size="md"
                  style={{ marginTop: 4 }}
                >
                  Tenants
                </StandardText>
              </View>

              <Button
                mode="contained"
                buttonColor={colors.white}
                contentStyle={{ paddingVertical: 4 }}
                labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                style={{
                  borderRadius: 5,
                  borderColor: colors.black,
                  borderWidth: 1,
                }}
                onPress={() => {}}
              >
                <StandardText textAlign="center" size="md" style={{ flex: 1 }}>
                  VIEW
                </StandardText>
              </Button>
            </View>
          </StandardCard>
        </View>

        <Gap size="lg" />
        <Gap size="lg" />
        <Gap size="lg" />
        <Gap size="lg" />
      </ScrollView>
    </View>
  );
};

export default RentDetails;
