import React, {useContext, useState} from 'react';
import {ScrollView, StyleSheet, View, Image} from 'react-native';
import {
  TextInput,
  Button,
  IconButton,
  useTheme,
  Chip,
} from 'react-native-paper';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';

import {ThemeContext} from '../../context/ThemeContext';
import Gap from '../Gap/Gap';

import * as ImagePicker from 'react-native-image-picker';
import colors from '../../theme/color';

const AddRoom = ({handleClosePress}) => {
  const {theme: mode} = useContext(ThemeContext);
  const theme = useTheme();
  const [room, setRoom] = useState('');
  const [beds, setBeds] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [amenities, setAmenities] = useState(['AC', 'Fan', 'Geyser']);
  const [showAmenityInput, setShowAmenityInput] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [roomImage, setRoomImage] = useState(null);

  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setRoomImage(response.assets[0].uri);
        }
      },
    );
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: '#000000aa',
      justifyContent: 'center',
      padding: 20,
    },
    calendarContainer: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 10,
    },
    closeButton: {
      position: 'absolute',
      top: -18,
      right: 5,
      zIndex: 999,
    },
    amenitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
    },
    amenityButton: {
      width: '45%',
      marginBottom: 8,
    },
    imagePreview: {
      width: '100%',
      height: 150,
      borderRadius: 10,
      marginBottom: 10,
    },
  });

  return (
    <ScrollView style={{width: '100%', paddingHorizontal: 15}}>
      <View style={{position: 'relative'}}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            handleClosePress();
            setRoom('');
            setBeds('');
            setRent('');
            setDeposit('');
            setAmenities(['AC', 'Fan', 'Geyser']);
            setRoomImage(null);
          }}
          style={styles.closeButton}
          iconColor={colors.black}
        />
        <StandardText
          textAlign="center"
          size="md"
          fontWeight="bold"
          style={{marginBottom: 10}}>
          Add Room
        </StandardText>

        <StandardCard>
          {/* Room & Beds */}
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
              <StandardText>Room Name</StandardText>
              <TextInput
                label="Room"
                value={room}
                onChangeText={setRoom}
                mode="outlined"
                left={<TextInput.Icon icon="door" />}
                style={{marginBottom: 10}}
              />
            </View>

            <View style={{flex: 1}}>
              <StandardText>No of Beds</StandardText>
              <TextInput
                label="Beds"
                value={beds}
                onChangeText={setBeds}
                placeholder="4"
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="bed" />}
                style={{marginBottom: 10}}
              />
            </View>
          </View>

          {/* Rent & Deposit */}
          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
              <StandardText>Room Rent</StandardText>
              <TextInput
                label="Rent"
                value={rent}
                onChangeText={setRent}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="cash" />}
                style={{marginBottom: 10}}
              />
            </View>

            <View style={{flex: 1}}>
              <StandardText>Deposit</StandardText>
              <TextInput
                label="Deposit"
                value={deposit}
                onChangeText={setDeposit}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="wallet" />}
                style={{marginBottom: 10}}
              />
            </View>
          </View>

          {/* Amenities */}
          <StandardText style={{marginTop: 10}}>Amenities</StandardText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 5,
            }}>
            {amenities.map((item, index) => (
              <Chip
                key={index}
                style={{
                  marginBottom: 5,
                  backgroundColor: mode === 'dark' ? '#2e2e2e' : '#e0e0e0',
                }}
                onClose={() => {
                  setAmenities(amenities.filter((_, i) => i !== index));
                }}>
                {item}
              </Chip>
            ))}
            <Chip
              icon="plus"
              onPress={() => setShowAmenityInput(true)}
              style={{
                backgroundColor: mode === 'dark' ? '#2e2e2e' : '#f5f5f5',
                marginBottom: 5,
              }}>
              Add
            </Chip>
          </View>

          {showAmenityInput && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8,
              }}>
              <TextInput
                label="New Amenity"
                value={newAmenity}
                onChangeText={setNewAmenity}
                mode="outlined"
                style={{flex: 1, marginRight: 8}}
              />
              <IconButton
                icon="check"
                onPress={() => {
                  if (
                    newAmenity.trim() !== '' &&
                    !amenities.includes(newAmenity.trim())
                  ) {
                    setAmenities(prev => [...prev, newAmenity.trim()]);
                    setNewAmenity('');
                    setShowAmenityInput(false);
                  }
                }}
              />
              <IconButton
                icon="close"
                onPress={() => {
                  setNewAmenity('');
                  setShowAmenityInput(false);
                }}
              />
            </View>
          )}

          {/* Room Image Upload */}
          <Gap size="sm" />
          <StandardText>Room Image</StandardText>
          {roomImage ? (
            <Image source={{uri: roomImage}} style={styles.imagePreview} />
          ) : null}
          <Button
            icon="image"
            mode="outlined"
            onPress={pickImage}
            style={{marginBottom: 10}}>
            {roomImage ? 'Change Image' : 'Upload Image'}
          </Button>

          {/* Submit */}
          <Button
            mode="contained"
            icon="content-save"
            onPress={() => {
              handleClosePress();
            }}
            style={{marginTop: 10}}>
            Add
          </Button>
        </StandardCard>
      </View>
    </ScrollView>
  );
};

export default AddRoom;
