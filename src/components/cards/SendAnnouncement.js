import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  TextInput,
  Checkbox,
  useTheme,
  Button,
  IconButton,
} from 'react-native-paper';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';

import { ThemeContext } from '../../context/ThemeContext';
import colors from '../../theme/colors';

const SendAnnouncement = ({ handleClosePress }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();

  const [title, setTitle] = useState('');

  const [rentPaid, setRentPaid] = useState(null);

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
  });

  return (
    <ScrollView style={{ width: '100%', paddingHorizontal: 15 }}>
      <View style={{ position: 'relative' }}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            handleClosePress();
          }}
          style={styles.closeButton}
          iconColor={colors.black}
        />
        <StandardText
          textAlign="center"
          size="md"
          fontWeight="bold"
          style={{ marginBottom: 10 }}
        >
          Send Announcement
        </StandardText>

        <StandardCard>
          <StandardText>Title</StandardText>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            left={<TextInput.Icon icon="format-title" />}
            style={{ marginBottom: 10 }}
          />
          {/* Announcements/ Message */}

          <StandardText>Message</StandardText>
          <TextInput
            label="Message"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            left={<TextInput.Icon icon="message" />}
            multiline
            numberOfLines={6}
            style={{ marginBottom: 10 }}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <StandardText style={{ marginRight: 10 }}>Recepients:</StandardText>
            <Checkbox
              status={rentPaid === true ? 'checked' : 'unchecked'}
              onPress={() => setRentPaid(true)}
              color={colors.primary}
            />
            <Text>Everyone</Text>
            <Checkbox
              status={rentPaid === false ? 'checked' : 'unchecked'}
              onPress={() => setRentPaid(false)}
              color={colors.primary}
            />
            <Text>Tenants with Dues</Text>
          </View>

          <Button
            mode="contained"
            icon="content-save"
            onPress={() => {
              handleClosePress();
            }}
            style={{ marginTop: 10 }}
          >
            Send Announcement
          </Button>
        </StandardCard>
      </View>
    </ScrollView>
  );
};

export default SendAnnouncement;
