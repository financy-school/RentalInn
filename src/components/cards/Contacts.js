import React, { useContext, useEffect, useState } from 'react';
import { View, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import {
  TextInput,
  IconButton,
  useTheme,
  Avatar,
  List,
  Modal,
  Portal,
  FAB,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';
import { ThemeContext } from '../../context/ThemeContext';
// import ContactsLib from 'react-native-contacts';
import { Linking, Alert } from 'react-native';
import { colors } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Add this import

const Contacts = ({ handleClosePress }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();

  const [contacts, setContacts] = useState([]);
  const [showNewContact, setShowNewContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        if (Platform.OS === 'android') {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
          );
          if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Permission denied');
            return;
          }
        }
        // const contactList = await ContactsLib.getAll();
        // setContacts(contactList);
      } catch (error) {
        console.error('Error loading contacts', error);
      }
      setLoading(false);
    };

    loadContacts();
  }, []);

  const addNewContact = async () => {
    if (!newName || !newPhone) return;

    const contact = {
      familyName: newName,
      phoneNumbers: [{ label: 'mobile', number: newPhone }],
    };

    try {
      // await ContactsLib.addContact(contact);
      // const updatedList = await ContactsLib.getAll();
      // setContacts(updatedList);
      setNewName('');
      setNewPhone('');
      setShowNewContact(false);
    } catch (err) {
      console.error('Failed to add contact', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      width: '100%',
    },
    scrollContent: {
      padding: 16,
    },
    closeButton: {
      position: 'absolute',
      top: -18,
      right: 5,
      zIndex: 999,
    },
    contactCard: {
      marginBottom: 10,
    },
    modalStyle: {
      backgroundColor: 'white',
      padding: 20,
      marginHorizontal: 20,
      borderRadius: 10,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 100,
      backgroundColor: colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ position: 'relative' }}>
          <IconButton
            icon="close"
            size={24}
            onPress={handleClosePress}
            style={styles.closeButton}
            iconColor={colors.black}
          />
          <StandardText
            textAlign="center"
            size="md"
            fontWeight="bold"
            style={{ marginBottom: 10 }}
          >
            Contacts
          </StandardText>

          <StandardCard>
            {loading ? (
              <ActivityIndicator
                animating={true}
                size="large"
                style={{ marginVertical: 20 }}
              />
            ) : contacts.length === 0 ? (
              <StandardText
                textAlign="center"
                size="sm"
                fontWeight="bold"
                style={{ marginBottom: 10 }}
              >
                No contacts found
              </StandardText>
            ) : (
              <>
                <StandardText
                  textAlign="center"
                  size="sm"
                  fontWeight="bold"
                  style={{ marginBottom: 10 }}
                >
                  {contacts.length} Contacts Found
                </StandardText>
                <StandardText
                  textAlign="center"
                  size="sm"
                  fontWeight="bold"
                  style={{ marginBottom: 10 }}
                >
                  Tap on a contact to call or message
                </StandardText>
              </>
            )}

            {!loading &&
              contacts.map((contact, index) => (
                <List.Item
                  key={index}
                  title={contact.displayName || contact.givenName}
                  description={
                    contact.phoneNumbers.length > 0
                      ? contact.phoneNumbers[0].number
                      : 'No number'
                  }
                  left={() => (
                    <Avatar.Text
                      label={
                        (contact.displayName || contact.givenName || '?')[0]
                      }
                      size={36}
                    />
                  )}
                  right={() => {
                    let phone = contact.phoneNumbers[0]?.number || '';
                    // Remove spaces, dashes, parentheses, etc.
                    phone = phone.replace(/[^+\d]/g, '');

                    // WhatsApp expects country code, so ensure it starts with '+'
                    if (phone && !phone.startsWith('+')) {
                      phone = '+91' + phone; // Change '+91' to your default country code if needed
                    }

                    const message = encodeURIComponent('Hello from RentalInn!'); // You can customize this message

                    return (
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        {/* Call Icon */}
                        <IconButton
                          icon="phone"
                          onPress={() => {
                            if (phone) {
                              Linking.openURL(`tel:${phone}`);
                            } else {
                              Alert.alert('No number available to call');
                            }
                          }}
                        />
                        <IconButton
                          icon={() => (
                            <MaterialCommunityIcons
                              name="whatsapp"
                              size={24}
                              color="#25D366"
                            />
                          )}
                          onPress={() => {
                            if (phone) {
                              // Ensure proper format for wa.me (no '+')
                              let waPhone = phone.replace('+', '');

                              const message = encodeURIComponent(
                                'Hello from RentalInn!',
                              );
                              const url = `https://wa.me/${waPhone}?text=${message}`;

                              Linking.openURL(url).catch(() => {
                                Alert.alert(
                                  'Could not open WhatsApp. Please check the number.',
                                );
                              });
                            } else {
                              Alert.alert('No number available for WhatsApp');
                            }
                          }}
                        />
                      </View>
                    );
                  }}
                  style={styles.contactCard}
                />
              ))}
          </StandardCard>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowNewContact(true)}
      />

      {/* Add Contact Modal */}
      <Portal>
        <Modal
          visible={showNewContact}
          onDismiss={() => setShowNewContact(false)}
          contentContainerStyle={styles.modalStyle}
        >
          <StandardText
            textAlign="center"
            size="md"
            fontWeight="bold"
            style={{ marginBottom: 10 }}
          >
            Add New Contact
          </StandardText>

          <TextInput
            label="Name"
            value={newName}
            onChangeText={setNewName}
            mode="outlined"
            style={{ marginBottom: 10 }}
          />
          <TextInput
            label="Phone"
            value={newPhone}
            onChangeText={setNewPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={{ marginBottom: 10 }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <Button
              mode="outlined"
              onPress={() => {
                setShowNewContact(false);
                setNewName('');
                setNewPhone('');
              }}
            >
              Cancel
            </Button>
            <Button mode="contained" onPress={addNewContact}>
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default Contacts;
