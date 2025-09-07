import React, {useContext, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import {
  Text,
  TextInput,
  Checkbox,
  Switch,
  useTheme,
  Button,
  IconButton,
} from 'react-native-paper';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import {ThemeContext} from '../../context/ThemeContext';
import Gap from '../Gap/Gap';
import dayjs from 'dayjs';
import colors from '../../theme/color';

const AddTenant = ({handleClosePress}) => {
  const {theme: mode} = useContext(ThemeContext);
  const theme = useTheme();

  const [tenantName, setTenantName] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString());
  const [rentPaid, setRentPaid] = useState(null);
  const [depositPaid, setDepositPaid] = useState(null);
  const [rent, setRent] = useState('');
  const [advance, setAdvance] = useState('');
  const [automaticRentReminder, setAutomaticRentReminder] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

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
            setRentPaid(null);
            setDepositPaid(null);
            setRent('');
            setAdvance('');
            setAutomaticRentReminder(false);
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
          Add Tenant
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
                <StandardText>Joining Date</StandardText>
                <TextInput
                  label="Joining Date"
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

          <StandardText>Rent (First Month)</StandardText>
          <TextInput
            label="Rent"
            value={rent}
            onChangeText={setRent}
            keyboardType="numeric"
            mode="outlined"
            left={<TextInput.Icon icon="currency-inr" />}
            style={{marginBottom: 10}}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <StandardText style={{marginRight: 10}}>Rent Status:</StandardText>
            <Checkbox
              status={rentPaid === true ? 'checked' : 'unchecked'}
              onPress={() => setRentPaid(true)}
              color={colors.primary}
            />
            <Text>Paid</Text>
            <Checkbox
              status={rentPaid === false ? 'checked' : 'unchecked'}
              onPress={() => setRentPaid(false)}
              color={colors.primary}
            />
            <Text>Unpaid</Text>
          </View>

          <StandardText>Security Deposit</StandardText>
          <TextInput
            label="Advance"
            value={advance}
            onChangeText={setAdvance}
            keyboardType="numeric"
            mode="outlined"
            left={<TextInput.Icon icon="bank" />}
            style={{marginBottom: 10}}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <StandardText style={{marginRight: 10}}>
              Deposit Status:
            </StandardText>
            <Checkbox
              status={depositPaid === true ? 'checked' : 'unchecked'}
              onPress={() => setDepositPaid(true)}
              color={colors.primary}
            />
            <Text>Paid</Text>
            <Checkbox
              status={depositPaid === false ? 'checked' : 'unchecked'}
              onPress={() => setDepositPaid(false)}
              color={colors.primary}
            />
            <Text>Unpaid</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <StandardText style={{flex: 1}}>
              Automatic Rent Reminder
            </StandardText>
            <Switch
              value={automaticRentReminder}
              onValueChange={setAutomaticRentReminder}
              color={colors.primary}
            />
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
            Save Tenant
          </Button>
        </StandardCard>
      </View>
    </ScrollView>
  );
};

export default AddTenant;
