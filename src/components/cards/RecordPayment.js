import React, {useContext, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import {TextInput, useTheme, Button, IconButton} from 'react-native-paper';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import {ThemeContext} from '../../context/ThemeContext';
import Gap from '../Gap/Gap';
import dayjs from 'dayjs';
import colors from '../../theme/color';

const RecordPayment = ({handleClosePress}) => {
  const {theme: mode} = useContext(ThemeContext);
  const theme = useTheme();

  const [tenantName, setTenantName] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString());

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const paymentModes = [
    {label: 'Cash', icon: 'cash'},
    {label: 'UPI', icon: 'qrcode-scan'},
    {label: 'Bank Transfer', icon: 'bank'},
    {label: 'Others', icon: 'dots-horizontal'},
  ];

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

  const defaultStyles = useDefaultStyles();
  const calendarStyles = {
    ...defaultStyles,
    container: {
      ...defaultStyles.container,
      backgroundColor: mode === 'dark' ? '#121212' : '#fff',
    },
    headerContent: {
      ...defaultStyles.headerContent,
      backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fff',
    },
    monthTitleText: {
      ...defaultStyles.monthTitleText,
      color: mode === 'dark' ? '#ffffff' : '#000000',
    },
    weekDayLabelText: {
      ...defaultStyles.weekDayLabelText,
      color: mode === 'dark' ? '#bbbbbb' : '#666666',
    },
    dateText: {
      ...defaultStyles.dateText,
      color: mode === 'dark' ? '#ffffff' : '#000000',
    },
    selectedDateContainer: {
      ...defaultStyles.selectedDateContainer,
      backgroundColor: mode === 'dark' ? '#333333' : colors.primary,
    },
    selectedDateText: {
      ...defaultStyles.selectedDateText,
      color: '#fff',
    },
  };

  return (
    <ScrollView style={{width: '100%', paddingHorizontal: 15}}>
      <View style={{position: 'relative'}}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => {
            handleClosePress();
            setTenantName('');
            setRoom('');
            setPhone('');
            setJoiningDate(new Date().toISOString());

            setCalendarVisible(false);
          }}
          style={styles.closeButton}
          iconColor={colors.black}
        />
        <StandardText
          textAlign="center"
          size="md"
          fontWeight="bold"
          style={{marginBottom: 10}}>
          Record Payment
        </StandardText>

        <StandardCard>
          <StandardText>Tenant Name</StandardText>
          <TextInput
            label="Tenant Name"
            value={tenantName}
            onChangeText={setTenantName}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            style={{marginBottom: 10}}
          />

          <StandardText>Phone</StandardText>
          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
            style={{marginBottom: 10}}
          />

          <View style={{flexDirection: 'row', gap: 10}}>
            <View style={{flex: 1}}>
              <StandardText>Room</StandardText>
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
              <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                <StandardText>Payment Date</StandardText>
                <TextInput
                  label="Payment Date"
                  value={dayjs(joiningDate).format('YYYY-MM-DD')}
                  onChangeText={setJoiningDate}
                  placeholder="YYYY-MM-DD"
                  mode="outlined"
                  editable={false}
                  left={<TextInput.Icon icon="calendar" />}
                  style={{marginBottom: 10}}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Mode - Cash, UPI, Bank Transfer, Others */}

          <StandardText>Payment Mode</StandardText>

          <View style={{marginTop: 10}}>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
              {paymentModes.map(mode => (
                <Button
                  key={mode.label}
                  mode={paymentMode === mode.label ? 'contained' : 'outlined'}
                  onPress={() => setPaymentMode(mode.label)}
                  icon={mode.icon}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    borderRadius: 20,
                  }}>
                  {mode.label}
                </Button>
              ))}
            </View>
          </View>

          <Modal
            visible={calendarVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setCalendarVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.calendarContainer}>
                <DateTimePicker
                  mode="single"
                  onChange={value => {
                    setJoiningDate(value.date);
                  }}
                  styles={calendarStyles}
                  date={joiningDate}
                  locale="en"
                />
                <Gap size="sm" />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Button
                    mode="outlined"
                    textColor={colors.black}
                    style={{width: '45%', borderRadius: 5}}
                    onPress={() => {
                      setCalendarVisible(false);
                      setJoiningDate(null);
                    }}>
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    style={{width: '45%', borderRadius: 5}}
                    onPress={() => {
                      if (joiningDate.date) {
                        setJoiningDate(joiningDate.date);
                      }
                      setCalendarVisible(false);
                    }}>
                    Done
                  </Button>
                </View>
              </View>
            </View>
          </Modal>

          <Button
            mode="contained"
            icon="content-save"
            onPress={() => {
              handleClosePress();
            }}
            style={{marginTop: 10}}>
            Record Payment
          </Button>
        </StandardCard>
      </View>
    </ScrollView>
  );
};

export default RecordPayment;
