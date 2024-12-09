import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Modal, TextInput, ToastAndroid, ProgressBarAndroid, Image } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import Sidebar from './CalendarSideBar';
import moment from 'moment';
import { colors } from '../util/color-options';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Dialog from '../components/Dialog';
import 'dayjs/locale/ja';
import { colorOptions } from '../util/color-options';
import CreateButton from './buttons/CreateButton';
import { editDocument } from '../api/firestore/edit';
import { retrieveDocs } from '../api/firestore/retrieve-data';
import { db } from '../../firebase.config';
import uuidGeneration from 'react-native-uuid';
import { cancelAlarm, setAlarm } from '../util/alarm-manage';

var compareTemp = {
  start: '',
  end: '',
  notificationId: ''
};   //set global variable for special situation  <]:)

const MyCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY年MM月'));
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [viewModes, setViewModes] = useState([
    { id: 0, value: 'schedule', label: 'スケジュール', icon: require('../assets/calendar-view-day.png') },
    { id: 1, value: 'day', label: '日', icon: require('../assets/calendar-view-day.png') },
    { id: 2, value: '3days', label: '3 日', icon: require('../assets/calendar-view-day.png') },
    { id: 3, value: 'week', label: '週', icon: require('../assets/calendar-view-week.png') },
    { id: 4, value: 'month', label: '月', icon: require('../assets/calendar-view-month.png') },
  ])
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [calendars, setCalendars] = useState([]);
  const [originalSchedules, setOriginalSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };
  /**
   * retrieve data when changed current month
   */
  useEffect(() => {
    refresh();
  }, [currentMonth])

  /**
   * initialize with starting
   */
  useEffect(() => {
    initialize();
  }, [])

  const initialize = async () => {
    loadCalendars();
    loadChanges();
  }

  /**
   * set original Schedules when search method out
   */
  useEffect(() => {
    if (viewMode != 'schedule') {
      matchSchedules();
    }
  }, [viewMode])

  /**
   * change schedules list when check or uncheck calendar item in sidebar
   */
  useEffect(() => {
    matchSchedules();
  }, [calendars])

  const matchSchedules = () => {
    if (calendars.length < 1) return;
    let scheduleList = [];
    calendars?.forEach(calendarItem => {
      originalSchedules?.forEach(scheduleItem => {
        if (calendarItem.checked && scheduleItem.calendarId == calendarItem.cid) scheduleList.push(scheduleItem);
      })
    });
    setSchedules(scheduleList);
    AsyncStorage.setItem('calendars', JSON.stringify(calendars));
  }

  const loadCalendars = async () => {
    /**
     * set saved calendars to state if there is saved one.
     */
    const savedCalendars = await AsyncStorage.getItem('calendars');
    if (savedCalendars) {
      setCalendars(JSON.parse(savedCalendars));
      return;
    }
    /**
     * set retrieved calendars to state if there isn't saved data.
     */
    const userId = await AsyncStorage.getItem('userId');
    const calendarList = await retrieveDocs({ collectionName: 'calendar', userId });
    const mappedCalendars = calendarList.map((item, index) => ({
      index: index,
      id: item.id,
      cid: item.cid,
      title: item.summary,
      backColor: colorOptions[index].value,
      checked: true,
    }));
    setCalendars(mappedCalendars);
  }

  /**
   * refresh all datas
   */
  const refresh = async () => {
    setIsLoading(true);
    try {
      console.log('Refresh!')
      const userId = await AsyncStorage.getItem('userId');

      //retrieve datas from firestore at first
      const startDate = moment(currentMonth, 'YYYY年MM月').startOf('month').subtract(5, 'days').format('YYYY-MM-DDT00:00:00.000Z');
      const endDate = moment(currentMonth, 'YYYY年MM月').endOf('month').add(5, 'days').format('YYYY-MM-DDT00:00:00.000Z');
      const events = await retrieveDocs({ collectionName: 'schedule', userId, startDate, endDate });
      let schedulesTemp = [];    // temp array
      for (const item of events) {
        const start = new Date(moment(item.dateTime.date + 'T' + item.dateTime.time.start, 'YYYYMMDDTHH:mm:ss'));    //start date for calendar
        const end = new Date(moment(item.dateTime.date + 'T' + item.dateTime.time.end, 'YYYYMMDDTHH:mm:ss'));   //end date for calendar
        if (start > new Date() && !item.hasOwnProperty('notificationId')) {   //set notification if date after and no notfication id
          const uuid = uuidGeneration.v4();
          setAlarm({ time: moment(start).subtract(item.remindTime, 'minutes'), day: -2, title: item.title, uuid });
          compareTemp = { start, end, notificationId: JSON.stringify([uuid]) };
          editDocument({ collectionName: 'schedule', updatedItem: { ...item, notificationId: JSON.stringify([res]) }, userId });    //insert notification id into firestore for next using
          schedulesTemp.push({ ...item, notificationId: res, start, end });
        } else {
          schedulesTemp.push({ ...item, start, end });
        }
      };
      setOriginalSchedules(schedulesTemp);
      setSchedules(schedulesTemp);
    } catch (error) {
      console.log('Loading error:', error)
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @function loadChanges
   * @param {Function} userId - uid for retrieve data from firestore
   */
  const loadChanges = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const scheduleQuery = query(collection(db, "schedule"), where('userId', '==', userId));
    let compareItem = {}
    /**
     * snapshot start
     */
    onSnapshot(scheduleQuery, (snapshot) => {
      if (snapshot.docChanges().length > 1) return;   //ignore when retrieve all datas.
      snapshot.docChanges().forEach(async change => {
        if (!change.doc.data()) return;
        const changedData = change.doc.data();
        const item = { ...changedData, id: change.doc.id };
        if (compareItem != JSON.stringify(item)) {
          compareItem = JSON.stringify(item);
          const start = new Date(moment(item.dateTime.date + 'T' + item.dateTime.time.start, 'YYYYMMDDTHH:mm:ss'));   //start and end variable for drawing calendar
          const end = new Date(moment(item.dateTime.date + 'T' + item.dateTime.time.end, 'YYYYMMDDTHH:mm:ss'));
          const date = moment(start).subtract(item.remindTime, 'minutes').format('YYYY-MM-DD');   //date and time for setting notification
          const time = moment(start).subtract(item.remindTime, 'minutes').format('HH:mm:ss');
          // do action according type of changes
          // if change of type is removed,
          if (change.type === 'removed') {
            console.log('Removed!');
            setSchedules(prev => prev.filter(schedule => schedule.id != item.id))   //remove schedule from calendar
            item.hasOwnProperty('notificationId') && cancelAlarm(item.notificationId);     //cancel notification if it has notification id
            //if change of type is added,
          } else if (change.type == 'added') {
            console.log('Added!')
            if (start > new Date()) {   //need to know future time for notification
              const uuid = uuidGeneration.v4();
              setAlarm({ time: moment(start).subtract(item.remindTime, 'minutes'), day: -2, title: item.title, uuid });
              const updatedItem = { ...item, notificationId: JSON.stringify([uuid]) };
              setSchedules(prev => [...prev, { ...updatedItem, start, end }]);      //add schedule into calendar showing
              compareTemp = { start: start, end: end, notificationId: JSON.stringify([uuid]) };
              editDocument({ collectionName: 'schedule', updatedItem, userId });    //edit firestore document with notification id
            } else {
              setSchedules(prev => [...prev, { ...item, start, end }]);   //add schedule directly if not future time
            }
            // if change of type is modified,
          } else if (change.type == 'modified') {
            console.log('Modified!');
            if (start > new Date()) {
              //ignore if already updated schedule
              console.log(compareTemp, item);
              if (compareTemp.notificationId == item.notificationId && moment(compareTemp.start).isSame(moment(start)) && moment(compareTemp.end).isSame(moment(end))) {
                console.log('This is changed already! I will ignore this.');
                compareTemp = { start: null, end: null, notificationId: '' };
                return;
              }
              //rewrite udpated item if not updated
              cancelAlarm(item.notificationId);
              const uuid = uuidGeneration.v4();
              setAlarm({ time: moment(start).subtract(item.remindTime, 'minutes'), day: -2, title: item.title, uuid });
              const updatedItem = { ...item, notificationId: JSON.stringify([uuid]) };
              compareTemp = { start, end, notificationId: updatedItem.notificationId };
              setSchedules(prev =>
                prev.map(schedule => {
                  if (schedule.id == item.id) return { ...updatedItem, start, end };
                  else return schedule;
                })
              )
              editDocument({ collectionName: 'schedule', updatedItem, userId });
            } else {
              //insert directly if passed time
              setSchedules(prev =>
                prev.map(schedule => {
                  if (schedule.id == item.id) return { ...item, start, end };
                  else return schedule;
                })
              )
            }
          }
        }
      });
    })
  }

  const onCreate = () => {
    setSelectedDate(new Date());
    setDialogVisible(true);
  }

  const onEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setDialogVisible(true);
  }

  const searchSchedule = () => {
    const filteredSchedule = schedules.filter(item => item.title.includes(keyword) || item.description.includes(keyword) || item.location.includes(keyword));
    setSchedules(filteredSchedule);
    setSearchVisible(false);
    setViewMode('schedule');
  }

  const onSwipe = (e) => {
    setCurrentMonth(moment(e).format('YYYY年MM月'));
  }

  const renderEvent = (event, styleProps) => {
    return (
      <TouchableOpacity
        onPress={(e) => {
          onEdit(event)
        }}
        style={[
          ...styleProps.style,
          { backgroundColor: event.backColor, padding: 0, justifyContent:'center' },
          viewMode === 'month' ? { height: 17 } : {}
        ]}
      >
        {
          viewMode === "month" ?
            <Text style={{ fontSize: 7, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} numberOfLines={viewMode === 'month' ? 1 : 3}>
              {`${event.title ? event.title : '(タイトルなし)'}`}
            </Text>
            :
            <Text style={{ fontSize: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} numberOfLines={viewMode === 'month' ? 1 : 3}>
              {`${event.title ? event.title : '(タイトルなし)'}`}
            </Text>
        }
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && <ProgressBarAndroid styleAttr='Horizontal' animating={isLoading} />}
      <View style={[styles.header]}>
        <View style={[styles.section, {}]}>
          <TouchableOpacity style={[styles.button]} onPress={() => { setSidebarVisible(true) }}>
            <Image style={[styles.icon]} source={require('../assets/menu.png')} />
          </TouchableOpacity>
          <Text style={[styles.button, { alignSelf: 'center', fontSize: 16 }]}>{currentMonth}</Text>
        </View>
        <View style={[styles.section]}>
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => { setKeyword(''); setSearchVisible(true) }}
          >
            <Image style={[styles.icon]} source={require('../assets/search.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button]} onPress={() => { setSelectedDate(new Date()); setCurrentMonth(moment().format('YYYY年MM月')) }}>
            <Image style={[styles.icon]} source={require('../assets/today.png')} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body} onLayout={handleLayout}>
        <Calendar
          locale="ja"
          events={schedules}
          // height={dimensions.height}
          height={720}
          mode={viewMode}
          date={selectedDate}
          activeDate={new Date()}
          renderEvent={renderEvent}
          onSwipeEnd={(e) => { onSwipe(e) }}
          eventMinHeightForMonthView={17}
          moreLabel="・・・"
          maxVisibleEventCount={4}
          onPressCell={(e) => {
            setSelectedDate(new Date(e));
            setCurrentMonth(moment(e).format('YYYY年MM月'));
            setDialogVisible(true);
          }}
        />
      </View>
      <Sidebar
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        viewModes={viewModes}
        viewMode={viewMode}
        setViewMode={setViewMode}
        calendars={calendars}
        setCalendars={setCalendars}
        refresh={refresh}
      />
      <CreateButton onPress={() => { onCreate() }} />
      <Dialog
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
        calendars={calendars}
        setSelectedSchedule={setSelectedSchedule}
        selectedSchedule={selectedSchedule}
        selectedDate={selectedDate}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={searchVisible}
        onRequestClose={() => setSearchVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalView}>
          <View style={[styles.searchHeader]}>
            <Text style={{ fontSize: 16 }}>スケジュールを検索</Text>
          </View>
          <View style={[styles.searchBody]}>
            <TextInput
              style={{ fontSize: 14, padding: 5, width: '100%', height: 50, borderColor: 'grey', borderWidth: 1, borderRadius: 5 }}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="キーワードを追加"
            />
          </View>
          <View style={[styles.searchFooter]}>
            <TouchableOpacity style={[styles.searchButton]} onPress={() => { setSearchVisible(false) }}>
              <Text style={{ fontSize: 12 }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.blue }]} onPress={() => { searchSchedule() }}>
              <Text style={{ color: colors.white, fontSize: 12 }}>検索</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendar: {
    height: '100%',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.gray,
    justifyContent: 'space-between'
  },
  body: {
    flex: 13,
    width: '100%',
    height: '100%'
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  keyword: {
    borderWidth: 1,
    height: '60%',
    alignSelf: 'center',
    paddingHorizontal: 5,
    borderRadius: 5,
    borderColor: 'grey'
  },
  modalView: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 20,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchHeader: {
    justifyContent: 'center',
    height: 50,
    marginBottom: 10
  },
  searchBody: {
    width: '80%',
    height: 50,
    justifyContent: 'center'
  },
  searchFooter: {
    flexDirection: 'row',
    width: '80%',
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  searchButton: {
    width: '40%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'lightgrey',
  },
  icon: {
    width: 20,
    height: 20
  }
});

export default MyCalendar;
