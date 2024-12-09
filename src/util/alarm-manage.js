import { NativeModules } from 'react-native';
import moment from 'moment';


const AlarmService = NativeModules.MyAlarmModule;

export async  function setAlarm (alarm) {
  console.log('Alarm', alarm);
  if(alarm.day == -2){
    await AlarmService.setAlarm(
      moment(alarm.time).year(), 
      moment(alarm.time).month() + 1, 
      moment(alarm.time).date(), 
      moment(alarm.time).hours(), 
      moment(alarm.time).minutes(), 
      alarm.title, 
      moment(alarm.time).format('YYYY年MM月DD日  HH:mm'),
      alarm.uuid
    ).then( response => {
      console.log('Setted Successfully: ', response);
    }).catch(error => {
      console.log('Set Failed: ', error);
    });
  }else{
     await AlarmService.setRepeatAlarm(
      moment(alarm.time).year(), 
      moment(alarm.time).month() + 1, 
      moment(alarm.time).date(), 
      moment(alarm.time).hours(), 
      moment(alarm.time).minutes(), 
      alarm.day,
      alarm.title, 
      moment(alarm.time).format('YYYY年MM月DD日  HH:mm'),
      alarm.uuid
    ).then( response => {
      console.log('Setted Successfully: ', response);
    }).catch(error => {
      console.log('Set Failed: ', error);
    });
  }
}

export async function cancelAlarm (param) {
  console.log(param);
  const uuids = JSON.parse(param);
  const length = uuids.length;
    for(let i = 0; i < length; i++){
      AlarmService.cancelAlarm(uuids[i]).then( response => {
        console.log('Result of Removing Result: ', response);
      });
    }
}
