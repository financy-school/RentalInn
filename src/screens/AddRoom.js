import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

import GradientCard from '../components/GradientCard/GradientCard';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import StyledButton from '../components/StyledButton/StyledButton';
import AnimatedChip from '../components/AnimatedChip/AnimatedChip';
import Gap from '../components/Gap/Gap';
import * as ImagePicker from 'react-native-image-picker';
import {
  createDocument,
  uploadToS3,
  createRoom,
  updateRoom,
} from '../services/NetworkUtils';
import StandardText from '../components/StandardText/StandardText';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

import StandardHeader from '../components/StandardHeader/StandardHeader';

const AddRoom = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const theme = useTheme();

  // Check if in edit mode
  const params = route?.params;
  const isEdit = params && params.isEdit;
  const editRoom = params && params.room;

  // Set navigation header title based on mode
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: isEdit ? 'Edit Room' : 'Add Room',
        headerTitleStyle: {
          fontFamily: 'Metropolis-Medium',
          fontSize: 18,
          fontWeight: '600',
        },
      });
    }, [navigation, isEdit]),
  );

  // Form state
  const [formData, setFormData] = useState({
    roomName: '',
    areaType: '',
    floorNumber: '',
    rentAmount: '',
    securityAmount: '',
    bedCount: '',
    bathroomCount: '',
    amenities: '',
    furnished: false,
    available: true,
    lastElectricityReading: '',
    lastElectricityReadingDate: '',
  });

  const [roomImages, setRoomImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Predefined options
  const areaTypes = ['BHK', 'RK'];

  // Helper to format date as YYYY-MM-DD
  const formatDate = date => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  // Handle date picker change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      handleInputChange('lastElectricityReadingDate', formatDate(selectedDate));
    }
  };

  // Open calendar for last electricity reading date
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Initialize form data for edit mode
  useEffect(() => {
    if (isEdit && editRoom) {
      setFormData({
        roomName: editRoom.roomName || editRoom.name || '',
        areaType: editRoom.areaType || '',
        floorNumber: editRoom.floorNumber?.toString() || '',
        rentAmount: editRoom.rentAmount?.toString() || '',
        securityAmount: editRoom.securityAmount?.toString() || '',
        bedCount:
          editRoom.bedCount?.toString() || editRoom.totalBeds?.toString() || '',
        bathroomCount: editRoom.bathroomCount?.toString() || '',
        amenities: Array.isArray(editRoom.amenities)
          ? editRoom.amenities.join(', ')
          : editRoom.amenities || '',
        furnished: !!editRoom.furnished,
        available: !!editRoom.available || !!editRoom.isAvailable,
        lastElectricityReading:
          editRoom.lastElectricityReading?.toString() || '',
        lastElectricityReadingDate: editRoom.lastElectricityReadingDate || '',
      });

      if (
        editRoom.image_document_id_list &&
        Array.isArray(editRoom.image_document_id_list)
      ) {
        setRoomImages([]);
      }
    }
  }, [isEdit, editRoom]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomName.trim()) newErrors.roomName = 'Room name is required';
    if (!formData.areaType.trim()) newErrors.areaType = 'Area type is required';
    if (!formData.floorNumber.trim())
      newErrors.floorNumber = 'Floor number is required';
    if (!formData.rentAmount.trim())
      newErrors.rentAmount = 'Rent amount is required';
    if (!formData.securityAmount.trim())
      newErrors.securityAmount = 'Security amount is required';
    if (!formData.bedCount.trim()) newErrors.bedCount = 'Bed count is required';
    if (!formData.bathroomCount.trim())
      newErrors.bathroomCount = 'Bathroom count is required';
    if (!formData.lastElectricityReading.trim())
      newErrors.lastElectricityReading = 'Last electricity reading is required';
    if (!formData.lastElectricityReadingDate.trim())
      newErrors.lastElectricityReadingDate =
        'Last electricity reading date is required';

    // Validate numeric fields
    if (formData.floorNumber && isNaN(formData.floorNumber))
      newErrors.floorNumber = 'Must be a number';
    if (
      formData.rentAmount &&
      (isNaN(formData.rentAmount) || parseFloat(formData.rentAmount) <= 0)
    )
      newErrors.rentAmount = 'Must be a positive number';
    if (
      formData.securityAmount &&
      (isNaN(formData.securityAmount) ||
        parseFloat(formData.securityAmount) < 0)
    )
      newErrors.securityAmount = 'Cannot be negative';
    if (
      formData.bedCount &&
      (isNaN(formData.bedCount) || parseInt(formData.bedCount, 10) < 0)
    )
      newErrors.bedCount = 'Must be a non-negative integer';
    if (
      formData.bathroomCount &&
      (isNaN(formData.bathroomCount) ||
        parseInt(formData.bathroomCount, 10) < 0)
    )
      newErrors.bathroomCount = 'Must be a non-negative integer';
    if (
      formData.lastElectricityReading &&
      (isNaN(formData.lastElectricityReading) ||
        parseFloat(formData.lastElectricityReading) < 0)
    )
      newErrors.lastElectricityReading = 'Cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 5,
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          const newImages = response.assets.map((asset, index) => ({
            ...asset,
            id: Date.now() + index,
            isExisting: false,
          }));
          setRoomImages(prev => [...prev, ...newImages].slice(0, 5));
        }
      },
    );
  };

  const removeImage = imageId => {
    setRoomImages(prev => prev.filter(img => img.id !== imageId));
  };

  const uploadNewImages = async () => {
    const imageDocumentIds = [];
    const newImages = roomImages.filter(img => !img.isExisting);

    for (const image of newImages) {
      try {
        const imageDetails = {
          file_name: image.fileName || image.uri.split('/').pop(),
          file_type: image.type,
          descriptor: 'Room Image',
          is_signature_required: false,
          doc_type: 'Room image',
        };

        const documentResponse = await createDocument(
          credentials.accessToken,
          credentials.property_id,
          imageDetails,
        );

        await uploadToS3(documentResponse.data.upload_url, image);
        imageDocumentIds.push(documentResponse.data.document_id);
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    return imageDocumentIds;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    submitRoom();
  };

  const submitRoom = async () => {
    setLoading(true);

    try {
      // Upload new images
      const newImageIds = await uploadNewImages();

      // Prepare existing image IDs
      const existingImageIds = roomImages
        .filter(img => img.isExisting)
        .map(img => img.documentId || img.id);

      const payload = {
        roomName: formData.roomName.trim(),
        areaType: formData.areaType,
        floorNumber: parseInt(formData.floorNumber, 10),
        rentAmount: parseFloat(formData.rentAmount),
        securityAmount: parseFloat(formData.securityAmount),
        bedCount: parseInt(formData.bedCount, 10),
        bathroomCount: parseInt(formData.bathroomCount, 10),
        amenities: formData.amenities,
        furnished: formData.furnished,
        available: formData.available,
        lastElectricityReading: parseFloat(formData.lastElectricityReading),
        lastElectricityReadingDate: formData.lastElectricityReadingDate,
        image_document_id_list: [...existingImageIds, ...newImageIds],
      };

      if (isEdit) {
        await updateRoom(credentials.accessToken, editRoom.id, payload);
      } else {
        await createRoom(
          credentials.accessToken,
          credentials.property_id,
          payload,
        );
      }

      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error('Room submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomName: '',
      areaType: '',
      floorNumber: '',
      rentAmount: '',
      securityAmount: '',
      bedCount: '',
      bathroomCount: '',
      amenities: '',
      furnished: false,
      available: true,
      lastElectricityReading: '',
      lastElectricityReadingDate: '',
    });
    setRoomImages([]);
    setErrors({});
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    headerContainer: {
      position: 'relative',
      alignItems: 'center',
    },
    titleContainer: {
      alignItems: 'center',
    },
    gradientTitle: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
    },
    sectionTitle: {
      marginBottom: 12,
      marginTop: 16,
      color: theme.colors.primary,
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    formColumn: {
      flex: 1,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginVertical: 12,
    },
    chip: {
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
      borderWidth: 1,
      borderColor: mode === 'dark' ? '#404040' : '#e0e0e0',
      borderRadius: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      color: mode === 'dark' ? '#ffffff' : '#333333',
      fontFamily: 'Metropolis-Medium',
      fontSize: 14,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    amenitiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
      marginBottom: 16,
    },
    amenityInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    amenityInput: {
      flex: 1,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginVertical: 16,
    },
    imageContainer: {
      position: 'relative',
    },
    roomImage: {
      width: (width - 80) / 3,
      height: (width - 80) / 3,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    imageUploadArea: {
      borderWidth: 2,
      borderColor: theme.colors.outline,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      marginVertical: 16,
    },
    submitContainer: {
      marginTop: 24,
      marginBottom: 32,
      gap: 12,
    },
    fieldLabel: {
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.error,
      marginTop: 4,
    },
    halfWidth: {
      width: '48%',
    },
    imageUploadText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <StandardHeader
        navigation={navigation}
        title={isEdit ? 'Edit Room' : 'Add Room'}
        loading={loading}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <GradientCard
          gradient={true}
          gradientColors={
            mode === 'dark' ? ['#2a2a2a', '#1f1f1f'] : ['#ffffff', '#f8f9fa']
          }
        >
          {/* Basic Information */}
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            🏠 Basic Information
          </StandardText>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Room Name *"
                value={formData.roomName}
                onChangeText={value => handleInputChange('roomName', value)}
                mode="outlined"
                left={<TextInput.Icon icon="home" />}
                placeholder="e.g., Deluxe Room A"
                error={errors.roomName}
              />
            </View>

            <View style={styles.formColumn}>
              <StandardText
                size="sm"
                fontWeight="600"
                style={styles.fieldLabel}
              >
                Area Type *
              </StandardText>
              <View style={styles.chipContainer}>
                {areaTypes.map(type => (
                  <AnimatedChip
                    key={type}
                    label={type}
                    selected={formData.areaType === type}
                    onPress={() => handleInputChange('areaType', type)}
                    size="medium"
                    style={[
                      styles.chip,
                      formData.areaType === type && styles.chipSelected,
                    ]}
                    textStyle={[
                      styles.chipText,
                      formData.areaType === type && styles.chipTextSelected,
                    ]}
                  />
                ))}
              </View>
              {errors.areaType && (
                <StandardText size="xs" style={styles.errorText}>
                  {errors.areaType}
                </StandardText>
              )}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Floor Number *"
                value={formData.floorNumber}
                onChangeText={value => handleInputChange('floorNumber', value)}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="stairs" />}
                placeholder="1"
                error={errors.floorNumber}
              />
            </View>

            <View style={styles.formColumn}>
              <StyledTextInput
                label="Number of Beds *"
                value={formData.bedCount}
                onChangeText={value => handleInputChange('bedCount', value)}
                placeholder="2"
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="bed" />}
                error={errors.bedCount}
              />
            </View>
          </View>

          <StyledTextInput
            label="Number of Bathrooms *"
            value={formData.bathroomCount}
            onChangeText={value => handleInputChange('bathroomCount', value)}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Icon icon="shower" />}
            placeholder="1"
            error={errors.bathroomCount}
            containerStyle={styles.halfWidth}
          />

          {/* Pricing Information */}
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            💰 Pricing Details
          </StandardText>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Rent Amount *"
                value={formData.rentAmount}
                onChangeText={value => handleInputChange('rentAmount', value)}
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="currency-inr" />}
                placeholder="5000"
                error={errors.rentAmount}
              />
            </View>

            <View style={styles.formColumn}>
              <StyledTextInput
                label="Security Amount *"
                value={formData.securityAmount}
                onChangeText={value =>
                  handleInputChange('securityAmount', value)
                }
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="shield-check" />}
                placeholder="10000"
                error={errors.securityAmount}
              />
            </View>
          </View>

          {/* Room Features */}
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            🛏️ Room Features
          </StandardText>

          <StyledTextInput
            label="Amenities"
            value={formData.amenities}
            onChangeText={value => handleInputChange('amenities', value)}
            mode="outlined"
            left={<TextInput.Icon icon="home-heart" />}
            placeholder="AC, WiFi, Geyser (separate by commas)"
            error={errors.amenities}
          />

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StandardText
                size="sm"
                fontWeight="600"
                style={styles.fieldLabel}
              >
                Furnished
              </StandardText>
              <View style={styles.chipContainer}>
                <AnimatedChip
                  label="Yes"
                  selected={formData.furnished === true}
                  onPress={() => handleInputChange('furnished', true)}
                  size="medium"
                  style={[
                    styles.chip,
                    formData.furnished === true && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.furnished === true && styles.chipTextSelected,
                  ]}
                />
                <AnimatedChip
                  label="No"
                  selected={formData.furnished === false}
                  onPress={() => handleInputChange('furnished', false)}
                  size="medium"
                  style={[
                    styles.chip,
                    formData.furnished === false && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.furnished === false && styles.chipTextSelected,
                  ]}
                />
              </View>
            </View>

            <View style={styles.formColumn}>
              <StandardText
                size="sm"
                fontWeight="600"
                style={styles.fieldLabel}
              >
                Available
              </StandardText>
              <View style={styles.chipContainer}>
                <AnimatedChip
                  label="Yes"
                  selected={formData.available === true}
                  onPress={() => handleInputChange('available', true)}
                  size="medium"
                  style={[
                    styles.chip,
                    formData.available === true && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.available === true && styles.chipTextSelected,
                  ]}
                />
                <AnimatedChip
                  label="No"
                  selected={formData.available === false}
                  onPress={() => handleInputChange('available', false)}
                  size="medium"
                  style={[
                    styles.chip,
                    formData.available === false && styles.chipSelected,
                  ]}
                  textStyle={[
                    styles.chipText,
                    formData.available === false && styles.chipTextSelected,
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Electricity Details */}
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            ⚡ Electricity Details
          </StandardText>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <StyledTextInput
                label="Last Electricity Reading *"
                value={formData.lastElectricityReading}
                onChangeText={value =>
                  handleInputChange('lastElectricityReading', value)
                }
                mode="outlined"
                keyboardType="numeric"
                left={<TextInput.Icon icon="gauge" />}
                placeholder="1250"
                error={errors.lastElectricityReading}
              />
            </View>

            <View style={styles.formColumn}>
              <TouchableOpacity onPress={openDatePicker}>
                <StyledTextInput
                  label="Reading Date *"
                  value={formData.lastElectricityReadingDate}
                  mode="outlined"
                  left={<TextInput.Icon icon="calendar" />}
                  placeholder="YYYY-MM-DD"
                  error={errors.lastElectricityReadingDate}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.lastElectricityReadingDate
                  ? new Date(formData.lastElectricityReadingDate)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Room Images */}
          <StandardText size="lg" fontWeight="600" style={styles.sectionTitle}>
            📸 Room Images ({roomImages.length}/5)
          </StandardText>

          {roomImages.length > 0 ? (
            <View style={styles.imageGrid}>
              {roomImages.map(img => (
                <View key={img.id} style={styles.imageContainer}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.roomImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(img.id)}
                  >
                    <StandardText
                      size="xs"
                      fontWeight="bold"
                      style={{ color: theme.colors.onErrorContainer }}
                    >
                      ×
                    </StandardText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.imageUploadArea}
              onPress={pickImages}
            >
              <StandardText size="md" style={styles.imageUploadText}>
                📷{'\n'}Tap to add room images{'\n'}(up to 5 images)
              </StandardText>
            </TouchableOpacity>
          )}

          {/* <StyledButton
          title={roomImages.length > 0 ? 'Add More Images' : 'Upload Images'}
          icon="camera-plus"
          variant="outlined"
          size="medium"
          onPress={pickImages}
          fullWidth={true}
          disabled={roomImages.length >= 5}
        /> */}

          {/* Submit Buttons */}
          <View style={styles.submitContainer}>
            <StyledButton
              title={
                loading
                  ? isEdit
                    ? 'Updating...'
                    : 'Creating...'
                  : isEdit
                  ? 'Update Room'
                  : 'Create Room'
              }
              icon={
                loading
                  ? 'loading'
                  : isEdit
                  ? 'content-save-edit'
                  : 'plus-circle'
              }
              variant="primary"
              size="large"
              onPress={handleSubmit}
              disabled={loading}
              loading={loading}
              fullWidth={true}
            />

            <StyledButton
              title="Cancel"
              icon="close"
              variant="outlined"
              size="medium"
              onPress={() => {
                if (!loading) navigation.goBack();
              }}
              disabled={loading}
              fullWidth={true}
            />
          </View>
        </GradientCard>

        <Gap size="lg" />
      </ScrollView>
    </View>
  );
};

export default AddRoom;
