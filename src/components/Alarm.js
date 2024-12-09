import { View, StyleSheet, ToastAndroid,} from 'react-native';
import CreateButton from '../components/buttons/CreateButton';
import { React, useEffect, useState } from 'react';
import { colors } from '../util/color-options';
import AlarmList from './AlarmList';
import { AlarmDatabase } from '../api/database';
import moment from 'moment';

const Alarm = ({ navigation }) => {

    const [alarms, setAlarms] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        // AlarmDatabase.deleteAll();
        navigation.addListener('focus', async () => {
            try {
                setIsSelecting(false);
                let datas = await AlarmDatabase.fetch();
                for(let i = 0; i < datas.length; i++){
                    if(datas[i].isActive && datas[i].autoDelete && JSON.parse(datas[i].frequence).id == 0 && moment(datas[i].time).isBefore(moment())){
                        AlarmDatabase.delete(datas[i].id);
                    }
                }
            } catch (error) {
                console.log('Auto Delete Error: ', error);
            }

            AlarmDatabase.fetch().then(res => {
                setAlarms(res);
            }).catch(error=>{
                console.log('AlarmDatabase getAll error', error);
                ToastAndroid.show('データベースからリストを取得できませんでした', ToastAndroid.SHORT);
            });
        });

    }, []);
    
    const editAlarm = (alarm) =>{
        navigation.push('alarm-creator', {selectedAlarm: alarm})
    }

    return (
        <View style={theme.container}>
            <View style={{ flex: 12, justifyContent: 'center'}}>
                <AlarmList alarms={alarms} editAlarm={editAlarm} isSelecting={isSelecting} setIsSelecting={setIsSelecting}/>
            </View>
            <CreateButton onPress={() => navigation.navigate('alarm-creator', {selectedAlarm: null})} />
        </View>
    )
}

const theme = StyleSheet.create({
    container:{ 
        flex: 1, 
        flexDirection: 'column', 
        backgroundColor: colors.gray 
    },
    spinnerTextStyle: { color: colors.darkgray},
    colors: { black: '#000', white: 'white' },
    logout:{width:25, height:25},
    button:{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.blue,
        borderRadius: 15,
        width: '45%',
        height: 50,
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 16
    },
    modalView: {
        position: 'absolute',
        top: '20%',
        alignSelf: 'center',
        width: '90%', // Set width as needed
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
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
    modalHeader:{

    },
    overlay: {
        flex: 1,
        backgroundColor: 'black',
        opacity: 0.4,
    },

    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    },
});

export default Alarm;