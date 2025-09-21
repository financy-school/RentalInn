import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import { CredentialsContext } from '../context/CredentialsContext';
import {
  createDocument,
  createTicket,
  uploadToS3,
} from '../services/NetworkUtils';
import StandardText from '../components/StandardText/StandardText';
import GradientCard from '../components/GradientCard/GradientCard';
import StyledButton from '../components/StyledButton/StyledButton';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import * as ImagePicker from 'react-native-image-picker';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const AddTicket = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const { credentials } = useContext(CredentialsContext);
  const [form, setForm] = useState({
    issue: '',
    description: '',
    raisedBy: '',
    roomId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roomImages, setRoomImages] = useState([]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!form.issue.trim()) {
      setError('Please enter the issue');
      return false;
    }
    if (!form.description.trim()) {
      setError('Please enter the description');
      return false;
    }
    if (!form.raisedBy.trim()) {
      setError('Please enter who raised the ticket');
      return false;
    }
    if (!form.roomId.trim()) {
      setError('Please enter the room ID');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    submitTicket();
  };

  const submitTicket = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const imageDocumentIds = [];

      // Upload images
      for (const image of roomImages) {
        const imagedetails = {
          file_name: image.fileName || image.uri.split('/').pop(),
          file_type: image.type,
          descriptor: 'Room Image',
          is_signature_required: false,
          doc_type: 'Room image',
        };

        const room_document_res = await createDocument(
          credentials.accessToken,
          credentials.property_id,
          imagedetails,
        );

        await uploadToS3(room_document_res.data.upload_url, image);
        imageDocumentIds.push(room_document_res.data.document_id);
      }

      const payload = {
        ...form,
        propertyId: credentials.property_id,
        status: 'PENDING',
        roomId: parseInt(form.roomId, 10),
        image_document_id_list: imageDocumentIds,
      };

      await createTicket(credentials.accessToken, payload);
      setSuccess('Ticket created successfully! 🎉');
      setForm({ issue: '', description: '', raisedBy: '', roomId: '' });
      setRoomImages([]);

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error('Ticket creation error:', err);
    } finally {
      setLoading(false);
    }
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
          setRoomImages(response.assets.slice(0, 5));
        }
      },
    );
  };

  const removeImage = index => {
    setRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = () => {
    if (error) return theme.colors.errorContainer;
    if (success) return theme.colors.primaryContainer;
    return theme.colors.surfaceVariant;
  };

  const getStatusTextColor = () => {
    if (error) return theme.colors.onErrorContainer;
    if (success) return theme.colors.onPrimaryContainer;
    return theme.colors.onSurfaceVariant;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingTop: 10,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    gradientTitle: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: 'center',
    },
    formSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.primary,
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
    statusContainer: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    submitContainer: {
      marginTop: 24,
      gap: 12,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <StandardHeader
        navigation={navigation}
        title="Add Ticket"
        loading={loading}
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <GradientCard
          gradient={true}
          gradientColors={[
            mode === 'dark' ? '#2a2a2a' : '#ffffff',
            mode === 'dark' ? '#1f1f1f' : '#f8f9fa',
          ]}
        >
          {/* Property Selection */}
          <PropertySelector
            navigation={navigation}
            requireSpecificProperty={true}
            actionContext="add-ticket"
            showAddButton={true}
            showTitle={true}
          />
          <Gap height={16} />

          {/* Issue Details Section */}
          <View style={styles.formSection}>
            <StandardText
              size="lg"
              fontWeight="600"
              style={styles.sectionTitle}
            >
              🔧 Issue Details
            </StandardText>

            <StyledTextInput
              label="Issue Title"
              value={form.issue}
              onChangeText={text => handleChange('issue', text)}
              placeholder="e.g., Water leakage in bathroom"
              left={<PaperInput.Icon icon="alert-circle" />}
            />

            <StyledTextInput
              label="Description"
              value={form.description}
              onChangeText={text => handleChange('description', text)}
              placeholder="Describe the issue in detail..."
              multiline
              numberOfLines={4}
              left={<PaperInput.Icon icon="text" />}
            />
          </View>

          {/* Reporter Details Section */}
          <View style={styles.formSection}>
            <StandardText
              size="lg"
              fontWeight="600"
              style={styles.sectionTitle}
            >
              👤 Reporter Information
            </StandardText>

            <StyledTextInput
              label="Raised By"
              value={form.raisedBy}
              onChangeText={text => handleChange('raisedBy', text)}
              placeholder="Your name or tenant name"
              left={<PaperInput.Icon icon="account" />}
            />

            <StyledTextInput
              label="Room ID"
              value={form.roomId}
              onChangeText={text => handleChange('roomId', text)}
              placeholder="e.g., 101, A-1, etc."
              keyboardType="numeric"
              left={<PaperInput.Icon icon="door" />}
            />
          </View>

          {/* Images Section */}
          <View style={styles.formSection}>
            <StandardText
              size="lg"
              fontWeight="600"
              style={styles.sectionTitle}
            >
              📸 Evidence Photos (up to 5) (Optional)
            </StandardText>

            <StandardText
              size="sm"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}
            >
              Add up to 5 photos to help us understand the issue better
            </StandardText>

            {roomImages.length > 0 ? (
              <View style={styles.imageGrid}>
                {roomImages.map((img, idx) => (
                  <View key={idx} style={styles.imageContainer}>
                    <Image
                      source={{ uri: img.uri }}
                      style={styles.roomImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(idx)}
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
                <StandardText
                  size="md"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textAlign: 'center',
                  }}
                >
                  📷{'\n'}Tap to add photos{'\n'}(up to 5 images)
                </StandardText>
              </TouchableOpacity>
            )}
            {/* 
          <StyledButton
            title={roomImages.length > 0 ? 'Change Images' : 'Add Images'}
            icon="camera-plus"
            variant="outlined"
            size="medium"
            onPress={pickImages}
            fullWidth={true}
          /> */}
          </View>

          {/* Status Messages */}
          {(error || success) && (
            <View
              style={[
                styles.statusContainer,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <StandardText
                size="md"
                fontWeight="600"
                style={{ color: getStatusTextColor(), textAlign: 'center' }}
              >
                {error ? `❌ ${error}` : `✅ ${success}`}
              </StandardText>
            </View>
          )}

          {/* Submit Buttons */}
          <View style={styles.submitContainer}>
            <StyledButton
              title={loading ? 'Creating Ticket...' : 'Create Ticket'}
              icon={loading ? 'loading' : 'send'}
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
              onPress={() => navigation.goBack()}
              disabled={loading}
              fullWidth={true}
            />
          </View>
        </GradientCard>
      </ScrollView>
    </View>
  );
};

export default AddTicket;
