import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Image, ToastAndroid } from 'react-native';
import { colors } from '../util/color-options';
import moment from 'moment';
import { cancelAlarm, setAlarm } from '../util/alarm-manage';
import uuidGeneration from 'react-native-uuid';
import { AlarmDatabase } from '../api/database';
const AlarmList = (props) => {

  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    const newAlarms = props.alarms.map((alarm) => ({
      ...alarm,
      checked: alarm.checked ?? false,
      active: alarm.active ? true : false
    }));

    setAlarms(newAlarms);
  }, [props.alarms]);

  const toggleChecked = (id) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, checked: !alarm.checked } : alarm
      )
    );
  };

  const handleLongPress = (id) => {
    props.setIsSelecting(true);
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => alarm.id == id ? { ...alarm, checked: true } : alarm)
    );
  };

  const selectAll = () => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => ({ ...alarm, checked: true }))
    );
  };

  const unSelectAll = () => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => ({ ...alarm, checked: false }))
    );
  };

  const deleteSelected = async () => {
    try {
      const deletionPromises = alarms.map(async (alarm) => {
        if (alarm.checked) {
          try {
            if (alarm.uuids) cancelAlarm(alarm.uuids)
            await AlarmDatabase.delete(alarm.id);
            return null; // Indicate deletion
          } catch (error) {
            ToastAndroid.show(`${alarm.summary}を削除できません。`);
            return alarm; // Return the alarm if deletion fails
          }
        } else {
          return alarm; // Keep the alarm if not checked
        }
      });

      // Wait for all deletions to complete
      const results = await Promise.all(deletionPromises);

      // Filter out null values (deleted alarms)
      const newAlarms = results.filter(alarm => alarm !== null);

      setAlarms(newAlarms);
    } catch (error) {
      console.error('Error removing selected alarms:', error);
    } finally {
      props.setIsSelecting(false);
    }
  };

  const toggleActive = async (item, e) => {
    let updatedAlarms = [];
    for (const alarm of alarms) {
      if (alarm.id == item.id) {
        if (e) {
          if (item.uuids) cancelAlarm(item.uuids);
            let uuids = [];
            const length = JSON.parse(item.frequence).value.length;
            for (let i = 0; i < length; i++) {
                let uuid = uuidGeneration.v4();
                setAlarm({ time: item.time, title: item.summary, day: JSON.parse(item.frequence).value[i], uuid });
                uuids.push(uuid);
            }
            await AlarmDatabase.update(
                item.id,
                item.time, 
                item.summary, 
                item.sound, 
                item.vibrate, 
                item.autoDelete, 
                item.frequence, 
                1, 
                JSON.stringify(uuids)
            );
          updatedAlarms.push({ ...item, active: e, uuids: JSON.stringify(uuids) });
        } else {
          if (item.uuids) cancelAlarm(item.uuids);
          AlarmDatabase.update(item.id, item.time, item.summary, item.sound, item.vibrate, item.autoDelete, item.frequence, item.summary, 0, '');
          updatedAlarms.push({ ...item, active: e, uuids: '' });
        }
      } else {
        updatedAlarms.push(alarm);
      }
    }

    setAlarms(updatedAlarms);
  };

  const toggleSelectAll = () => {
    alarms[0].checked ? unSelectAll() : selectAll();
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => { handleLongPress(item.id) }}
      onPress={() => { props.isSelecting ? toggleChecked(item.id) : props.editAlarm(item) }}
    >
      <View style={[theme.item,]}>
        <View style={theme.section5}>
          <Text style={[theme.time, moment(item.time).isBefore(moment()) && {color: colors.darkgray}]}>{JSON.parse(item.frequence).id == 0 && moment(item.time).format('YYYY年MM月DD日   ')}{`${moment(item.time).format('HH:mm')}`}</Text>
          <Text style={[theme.summary, moment(item.time).isBefore(moment()) && {color: colors.gray}]}>{item.summary ? item.summary : 'ラベルなし'}</Text>
        </View>
        <View style={theme.section1}>
          {
            props.isSelecting ? (
              item.checked ? (<Image style={theme.image} source={require('../assets/checked.png')} />)
                : (<Image style={theme.image} source={require('../assets/unchecked.png')} />)
            )
              : (<Switch
                style={theme.switch}
                trackColor={{ false: colors.gray, true: colors.darkgray }}
                thumbColor={item.active ? colors.blue : colors.darkgray}
                onValueChange={(e) => { toggleActive(item, e) }}
                value={item.active}
              />)
          }
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={theme.container}>
      {props.isSelecting && (
        <View style={[theme.header, {}]}>
          <TouchableOpacity style={[theme.button, {}]} onPress={() => { unSelectAll(); props.setIsSelecting(false); }}>
            <Image style={theme.image} source={require('../assets/multiply.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={theme.button} onPress={() => { toggleSelectAll() }}>
            <Image style={theme.image} source={require('../assets/selectall.png')} />
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={alarms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      {props.isSelecting && (
        <View style={theme.footer}>
          <TouchableOpacity style={theme.button} onPress={() => { deleteSelected() }}>
            <Image style={theme.image} source={require('../assets/delete.png')} />
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
};

const theme = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 5,
    paddingLeft: 5,
  },
  item: {
    flexDirection: 'row',
    height: 100,
    width: '98%',
    padding: 20,
    alignSelf: 'center',
    marginVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  section1: {
    flex: 1,
    justifyContent: 'center'
  },
  section5: {
    flex: 5,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  time: {
    fontSize: 16,
    color: colors.black
  },
  summary: {
    fontSize: 14,
    color: colors.darkgray,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  switch: {

  },
  image: {
    width: 30,
    height: 30
  }
});

export default AlarmList;
