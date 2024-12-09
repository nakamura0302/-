import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, ToastAndroid, StyleSheet, Image, ScrollView } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colorOptions, colors } from '../util/color-options';
import SelectDropdown from 'react-native-select-dropdown'
import { remindTime, remindUnit } from '../util/constants';
import { addDocument, } from '../api/firestore/add';
import { editDocument } from '../api/firestore/edit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeDocument } from '../api/firestore/remove';
import { addEvent } from '../api/google/add';
import { editEvent } from '../api/google/edit';
import { deleteEvent } from '../api/google/delete';
import CheckBox from '@react-native-community/checkbox';

const Dialog = ({ dialogVisible, setDialogVisible, calendars, selectedSchedule, setSelectedSchedule, selectedDate }) => {

  const [summary, setSummary] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [startDate, setStartDate] = useState(moment());
  const [endDate, setEndDate] = useState(moment());
  const [dtVisible, setDtVisible] = useState(false);
  const [dtViewMode, setDtViewMode] = useState('date');
  const [whichDt, setWhichDt] = useState('start');
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRemindUnit, setSelectedRemindUnit] = useState(remindTime[0]);
  const [selectedRemindTime, setSelectedRemindTime] = useState(remindUnit[0]);
  const [userId, setUserId] = useState(null);
  const [googleSync, setGoogleSync] = useState(true);


  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {

    if (!dialogVisible) {
      setSelectedSchedule(null);
      return;
    }
    setSelectedCalendar(selectedSchedule ? calendars.find(calendar => calendar.cid == selectedSchedule.calendarId) : calendars[0]);
    setSummary(selectedSchedule ? selectedSchedule.title : '');
    setDateTime(selectedSchedule ? new Date(selectedSchedule.start) : selectedDate);
    setStartDate(selectedSchedule ? selectedSchedule.start : selectedDate);
    setEndDate(selectedSchedule ? moment(selectedSchedule.dateTime.date + selectedSchedule.dateTime.time.end, 'YYYYMMDDHH:mm:ss') : moment(selectedDate).add(30, 'minutes'));
    setDtVisible(false);
    setDescription(selectedSchedule ? selectedSchedule.description : '');
    setLocation(selectedSchedule ? selectedSchedule.location : '');
    if (selectedSchedule) {
      if (selectedSchedule.remindTime % 1440 == 0) {
        setSelectedRemindTime(remindTime.find(item => item.value == selectedSchedule.remindTime / 1440))
        setSelectedRemindUnit(remindUnit[2])
      } else if (selectedSchedule.remindTime % 60 == 0) {
        setSelectedRemindTime(remindTime.find(item => item.value == selectedSchedule.remindTime / 60))
        setSelectedRemindUnit(remindUnit[1])
      } else {
        setSelectedRemindTime(remindTime.find(item => item.value == selectedSchedule.remindTime))
        setSelectedRemindUnit(remindUnit[0])
      }
    } else {
      setSelectedRemindTime(remindTime[0])
      setSelectedRemindUnit(remindUnit[0])
    }
    setGoogleSync(selectedSchedule ? selectedSchedule.googleSync : true);
  }, [dialogVisible])

  const showDateTime = (mode, which) => {
    setDtViewMode(mode);
    setWhichDt(which);
    setDateTime(new Date(which === 'start' ? startDate : endDate));
    setDtVisible(true);
  };

  const getRemindTime = (remindNumber) => {
    if (remindNumber % 1440 == 0) {
      remindTime.find(item => item.value == selectedSchedule.remindTime / 1440)
      remindUnit[2]
    } else if (remindNumber % 60 == 0) {
      remindTime.find(item => item.value == selectedSchedule.remindTime / 60)
      remindUnit[1]
    } else {
      remindTime.find(item => item.value == selectedSchedule.remindTime)
      remindUnit[0]
    }
  }

  const onDateTimeChange = (event, selectedDate) => {
    setDtVisible(false);
    if (event.type === 'dismissed') return;
    const currentDate = selectedDate || dateTime;
    if (whichDt === 'start') {
      setStartDate(moment(currentDate));
      moment(currentDate).isAfter(endDate) && setEndDate(moment(currentDate).add(30, 'minutes'));
    } else {
      setEndDate(moment(currentDate));
      moment(currentDate).isBefore(startDate) && setStartDate(moment(currentDate).subtract(30, 'minutes'));
    }
    setDateTime(currentDate);
  };

  const onSubmit = async () => {
    try {
      const defaultSchedule = {
        calendarId: selectedCalendar.cid ?? 'primary',
        backColor: selectedCalendar.backColor,
        dateTime: {
          allDay: false,
          once: true,
          date: moment(startDate).format('YYYYMMDD'),
          time: {
            start: moment(startDate).format('HH:mm:ss'),
            end: moment(endDate).format('HH:mm:ss'),
          },
        },
        id: selectedSchedule ? selectedSchedule.id : '',
        sid: selectedSchedule ? selectedSchedule.sid : '',
        description,
        location,
        remindTime: selectedRemindTime.value * selectedRemindUnit.value,
        title: summary,
        notificationId: selectedSchedule ? selectedSchedule.notificationId : '',
        start: moment(startDate).format('YYYY-MM-DDTHH:mm:ss.000Z'),
        googleSync: googleSync
      };

      if (selectedSchedule) {
        if (googleSync) {
          const res = await editEvent(defaultSchedule);
          if (res === 'success') {
            console.log(defaultSchedule);
            editDocument({ collectionName: 'schedule', updatedItem: defaultSchedule, userId });
          } else {
            const id = (await addEvent(defaultSchedule)).eventId;
            editDocument({ collectionName: 'schedule', updatedItem: { ...defaultSchedule, sid: id }, userId });
          }
        } else {
          deleteEvent(defaultSchedule);
          editDocument({ collectionName: 'schedule', updatedItem: defaultSchedule, userId });
        }
      } else {
        console.log('default schedule', defaultSchedule);
        const sid = googleSync ? (await addEvent(defaultSchedule)).eventId : defaultSchedule.sid;
        const item = { ...defaultSchedule, sid: sid }
        addDocument({ collectionName: 'schedule', item, userId });
      }
    } catch (error) {
      ToastAndroid.show('失敗しました。もう一度お試しください', ToastAndroid.SHORT);
      console.error('Error submitting schedule:', error);
    } finally {
      setDialogVisible(false);
    }
  };

  const onDelete = async () => {
    try {
      deleteEvent(selectedSchedule);
      removeDocument({ collectionName: 'schedule', docId: selectedSchedule.id, userId });
      setDialogVisible(false);
    } catch (error) {
      ToastAndroid.show('削除に失敗しました。もう一度お試しください', ToastAndroid.SHORT);
      console.error('Error deleting event:', error);
    }
  };

  const RemindRenderItem = () => {
    return (
      <View style={[styles.colSection7, {marginVertical: 2}]}>
        <SelectDropdown
          data={remindTime}
          onSelect={(selectedItem) => setSelectedRemindTime(selectedItem)}
          renderButton={(selectedItem) => (
            <View style={[styles.button, { width: '30%' }]}>
              <Text style={styles.dropdownButtonTxtStyle} numberOfLines={1}>
                {selectedItem && selectedItem.title}
              </Text>
            </View>
          )}
          renderItem={(item, index, isSelected) => (
            <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
              <Text style={styles.dropdownItemTxtStyle} numberOfLines={1}>{item.title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={true}
          dropdownStyle={styles.dropdownMenuStyle}
          defaultValueByIndex={selectedRemindTime.id}
        />

        <SelectDropdown
          data={remindUnit}
          onSelect={(selectedItem) => setSelectedRemindUnit(selectedItem)}
          renderButton={(selectedItem) => (
            <View style={[styles.button, { width: '25%' }]}>
              <Text style={styles.dropdownButtonTxtStyle} numberOfLines={1}>
                {selectedItem && selectedItem.title}
              </Text>
            </View>
          )}
          renderItem={(item, index, isSelected) => (
            <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
              <Text style={styles.dropdownItemTxtStyle} numberOfLines={1}>{item.title}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={true}
          dropdownStyle={styles.dropdownMenuStyle}
          defaultValueByIndex={selectedRemindUnit.id}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <TouchableOpacity style={[styles.remindIcon]}>
            <Image style={[styles.icon]} source={require('../assets/plus.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.remindIcon]}>
            <Image style={[styles.icon]} source={require('../assets/multiply.png')} />
          </TouchableOpacity>
        </View>
      </View>)
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={dialogVisible}
      onRequestClose={() => setDialogVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setDialogVisible(false)}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={styles.modalView}>
        <View style={[styles.rowSection, { justifyContent: 'center', height: 30 }]}>
          <Text style={{ fontSize: 14 }}>{`イベントを${selectedSchedule ? '更新' : '追加'}`}</Text>
        </View>

        {/* Title Input */}
        <View style={[styles.rowSection]}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/title.png')} />
          </View>
          <View style={styles.colSection7}>
            <TextInput
              style={styles.title}
              value={summary}
              onChangeText={setSummary}
              placeholder="タイトルを追加"
            />
          </View>
        </View>

        {/* Start Date and Time */}
        <View style={styles.rowSection}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/start.png')} />
          </View>
          <View style={styles.colSection7}>
            <TouchableOpacity style={styles.button} onPress={() => showDateTime('date', 'start')}>
              <Text style={styles.text}>{moment(startDate).format('YYYY年MM月DD日')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => showDateTime('time', 'start')}>
              <Text style={styles.text}>{moment(startDate).format('HH:mm')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* End Date and Time */}
        <View style={styles.rowSection}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/end.png')} />
          </View>
          <View style={styles.colSection7}>
            <TouchableOpacity style={styles.button} onPress={() => showDateTime('date', 'end')}>
              <Text style={styles.text}>{moment(endDate).format('YYYY年MM月DD日')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => showDateTime('time', 'end')}>
              <Text style={styles.text}>{moment(endDate).format('HH:mm')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Input */}
        <View style={styles.rowSection}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/location.png')} />
          </View>
          <View style={styles.colSection7}>
            <TextInput
              style={styles.location}
              placeholder='場所を追加'
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Description Input */}
        <View style={[styles.rowSection, { height: 100 }]}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/description.png')} />
          </View>
          <View style={styles.colSection7}>
            <TextInput
              style={styles.description}
              multiline
              numberOfLines={30}
              placeholder="説明を追加"
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
              scrollEnabled={true}
            />
          </View>
        </View>

        {/* Reminder Selection */}
        <View style={[styles.rowSection, { height: 150 }]}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/remind.png')} />
          </View>
          <ScrollView style={{margin: 5, width: '75%', borderRadius: 5}}>
            <RemindRenderItem />
            <RemindRenderItem />
            <RemindRenderItem />
            <RemindRenderItem />
            <RemindRenderItem />
            </ScrollView>
        </View>

        {/* Color Selection */}
        <View style={styles.rowSection}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/color.png')} />
          </View>
          <View style={styles.colSection7}>
            <SelectDropdown
              data={colorOptions}
              onSelect={(selectedItem) => { setSelectedColor(selectedItem) }}
              renderButton={(selectedItem) => (
                <View style={[styles.button, { width: '95%' }]}>
                  <Text style={[styles.dropdownButtonTxtStyle, { color: selectedColor.value }]} numberOfLines={1}>
                    {(selectedColor.label) || 'カレンダーなし'}
                  </Text>
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                  <Text style={[styles.dropdownItemTxtStyle, { color: item.value }]} numberOfLines={1}>{item.label}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              dropdownStyle={styles.dropdownMenuStyle}
              defaultValueByIndex={selectedColor.id}
            />
          </View>
        </View>

        {/* Calendar Selection */}
        <View style={styles.rowSection}>
          <View style={styles.colSection1}>
            <Image style={[styles.icon]} source={require('../assets/calendar.png')} />
          </View>
          <View style={styles.colSection7}>
            <SelectDropdown
              data={calendars}
              onSelect={(selectedItem) => { setSelectedCalendar(selectedItem) }}
              renderButton={(selectedItem) => (
                <View style={[styles.button, { width: '95%' }]}>
                  <Text style={styles.dropdownButtonTxtStyle} numberOfLines={1}>
                    {(selectedItem && selectedItem.title) || 'カレンダーなし'}
                  </Text>
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                  <Text style={styles.dropdownItemTxtStyle} numberOfLines={1}>{item.title}</Text>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              dropdownStyle={styles.dropdownMenuStyle}
              defaultValueByIndex={selectedCalendar ? selectedCalendar.index : 0}
            />
          </View>
        </View>
        <View style={[styles.rowSection, { height: 40 }]}>
          <View style={[styles.colSection1]}>
            <Image style={[styles.icon]} source={require('../assets/google.png')} />
          </View>
          <View style={[styles.colSection7]}>
            <CheckBox
              value={googleSync}
              onValueChange={() => { setGoogleSync(!googleSync); }}
            />
            <Text style={{ paddingHorizontal: 10, fontSize: 10 }}>Googleカレンダーに同期</Text>
          </View>
        </View>

        {/* Footer with Confirm and Delete Buttons */}
        <View style={styles.footer}>
          <View style={styles.delete}>
            {selectedSchedule &&
              <TouchableOpacity onPress={onDelete}>
                <Image style={[styles.icon]} source={require('../assets/delete.png')} />
              </TouchableOpacity>
            }
          </View>
          <View style={styles.confirm}>
            <TouchableOpacity style={styles.button} onPress={() => setDialogVisible(false)}>
              <Text style={{ fontSize: 10 }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.blue }]} onPress={onSubmit}>
              <Text style={{ fontSize: 10, color: colors.white, paddingHorizontal: 15 }}>{'確認'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DateTimePicker */}
        {dtVisible &&
          <DateTimePicker
            value={dateTime}
            mode={dtViewMode}
            is24Hour={true}
            display="default"
            onChange={onDateTimeChange}
          />
        }
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 10
  },
  delete: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirm: {
    flex: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  rowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50
  },
  colSection1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  colSection7: {
    flex: 7,
    alignItems: 'center',
    flexDirection: 'row'
  },
  title: {
    width: '95%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 7,
  },
  location: {
    width: '95%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    fontSize: 12,
    height: 40,
    paddingHorizontal: 10
  },
  description: {
    width: '95%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    height: 100
  },
  button: {
    height: 40,
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 10
  },
  text: {
    fontSize: 12
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 10,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 12,
    color: '#151E26',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 12,
    color: '#151E26',
    overflow: 'hidden'
  },
  icon: {
    width: 20,
    height: 20
  },
  remindIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray,
    borderRadius: 20,
    margin: 2
  }
});

export default Dialog;
