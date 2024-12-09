import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ToastAndroid, KeyboardAvoidingView, Switch, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useState } from 'react'
import { colors } from '../util/color-options';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlarmDatabase } from '../api/database';
import { cancelAlarm, setAlarm } from '../util/alarm-manage';
import { repeatOptions, rings } from '../util/constants';
import uuidGeneration from 'react-native-uuid';

const AlarmCreator = ({ route, navigation }) => {

    const { selectedAlarm } = route.params;

    const [sound, setSound] = useState(selectedAlarm ? JSON.parse(selectedAlarm.sound) : rings[0],);
    const [frequence, setFrequence] = useState(selectedAlarm ? JSON.parse(selectedAlarm.frequence) : repeatOptions[0]);
    const [vibrate, setVibrate] = useState(selectedAlarm ? selectedAlarm.vibrate : true);
    const [autoDelete, setAutoDelete] = useState(selectedAlarm ? selectedAlarm.autoDelete : false);
    const [summary, setSummary] = useState(selectedAlarm ? selectedAlarm.summary : '');
    const [active, setactive] = useState(selectedAlarm ? selectedAlarm.active : 1);
    const [modalVisible, setModalVisible] = useState(false);
    const [dateTime, setDateTime] = useState(selectedAlarm ? new Date(selectedAlarm.time) : new Date());
    const [date, setDate] = useState(selectedAlarm ? moment(selectedAlarm.time).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'));
    const [time, setTime] = useState(selectedAlarm ? moment(selectedAlarm.time).format('HH:mm:00') : moment().format('HH:mm:00'));
    const [dtVisible, setDtVisible] = useState(false);
    const [dtMode, setDtMode] = useState('time');
    const [label, setLabel] = useState(selectedAlarm ? selectedAlarm.summary : '');

    const action = () => {
        if (frequence.value.length < 1) {
            ToastAndroid.show('繰り返し日が選択されませんでした', ToastAndroid.SHORT);
            return;
        }
        if (frequence.id == 1 && moment(date + 'T' + time).isBefore(moment())) {
            ToastAndroid.show('今後の時間を選択してください', ToastAndroid.SHORT);
            return;
        }
        if (selectedAlarm) {
            editAlarm();
        } else {
            addAlarm();
        }
    }

    const showDateTime = (mode) => {
        setDtMode(mode);
        setDtVisible(true);
    }

    const onDateTimeChange = (event, selectedDate) => {
        setDtVisible(false);
        if (event.type === 'dismissed') {
            return;
        }
        const currentDate = selectedDate || dateTime;
        if (dtMode == 'date') {
            setDate(moment(currentDate).format('YYYY-MM-DD'));
        } else {
            setTime(moment(currentDate).format('HH:mm:00'));
        }
        setDateTime(currentDate);
    }

    async function addAlarm() {
        let uuids = [];
        const length = frequence.value.length;
        for (let i = 0; i < length; i++) {
            let uuid = uuidGeneration.v4();
            setAlarm({ time: date + 'T' + time, title: summary, day: frequence.value[i], uuid });
            uuids.push(uuid);
        }
        await AlarmDatabase.insert(
            moment(date + 'T' + time).toString(), 
            summary, 
            JSON.stringify(sound), 
            vibrate, 
            autoDelete, 
            JSON.stringify(frequence), 
            active, 
            JSON.stringify(uuids)
        );
        navigation.goBack();
    }

    async function editAlarm() {
        try {
            if (selectedAlarm.uuids) cancelAlarm(selectedAlarm.uuids);
            let uuids = [];
            const length = frequence.value.length;
            for (let i = 0; i < length; i++) {
                let uuid = uuidGeneration.v4();
                setAlarm({ time: date + 'T' + time, title: summary, day: frequence.value[i], uuid });
                uuids.push(uuid);
            }
            await AlarmDatabase.update(
                selectedAlarm.id,
                moment(date + 'T' + time).toString(), 
                summary, 
                JSON.stringify(sound), 
                vibrate, 
                autoDelete, 
                JSON.stringify(frequence), 
                active, 
                JSON.stringify(uuids)
            );
            navigation.goBack();
        } catch (error) {
            ToastAndroid.show('アラームを編集できません', ToastAndroid.SHORT);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={true}
        >
            <View style={theme.container}>
                <View style={[theme.option, { justifyContent: 'space-between' }]} >
                    <TouchableOpacity
                        style={[theme.confirmButton, {}]}
                        onPress={() => navigation.goBack()}
                    >
                        <Image style={theme.confirm} source={require('../assets/multiply.png')} />
                    </TouchableOpacity>
                    <Text style={[theme.text, { alignSelf: 'center' }]}>{selectedAlarm ? 'アラームの更新' : 'アラームを追加'}</Text>
                    <TouchableOpacity
                        style={theme.confirmButton}
                        onPress={() => {
                            action();
                        }}
                    >
                        <Image style={theme.confirm} source={require('../assets/tick.png')} />
                    </TouchableOpacity>
                </View>
                <View style={theme.dateTime}>
                    {frequence.id == 0 &&
                        <TouchableOpacity
                            onPress={() => { showDateTime('date') }}
                        >
                            <Text style={[theme.date, {}]}>{moment(date, 'YYYY-MM-DD').format('YYYY年MM月DD日')}</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity
                        onPress={() => { showDateTime('time') }}
                    >
                        <Text style={[theme.time, {}]}>{moment(time, 'HH:mm:ss').format('HH:mm')}</Text>
                    </TouchableOpacity>
                    {dtVisible &&
                        <DateTimePicker
                            value={dateTime}
                            mode={dtMode}
                            is24Hour={true}
                            display="default"
                            onChange={onDateTimeChange}
                        />
                    }
                </View>
                {/* <View style={theme.option}>
                    <TouchableOpacity style={theme.touch} onPress={() => { navigation.navigate('alarm-ring', { ring: sound, setRing: setSound }) }}>
                        <View style={[theme.section2]}>
                            <Text style={[theme.text, {}]}> アラーム音 </Text>
                        </View>
                        <View style={[theme.section1]}>
                            <Text style={[theme.text, { color: colors.darkgray }]}>{sound.label}</Text>
                        </View>
                    </TouchableOpacity>
                </View> */}
                <View style={theme.option}>
                    <TouchableOpacity style={theme.touch} onPress={() => { navigation.navigate('alarm-repeat', { repeat: frequence, setRepeat: setFrequence }) }}>
                        <View style={theme.section2}>
                            <Text style={[theme.text, {}]}> 繰り返す </Text>
                        </View>
                        <View style={[theme.section1, {}]}>
                            <Text style={[theme.text, { color: colors.darkgray }]}> {frequence.label} </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={theme.option}>
                    <View style={theme.section3}>
                        <Text style={[theme.text, {}]}>音が鳴ると振動する</Text>
                    </View>
                    <View style={theme.section1}>
                        <Switch
                            style={theme.switch}
                            trackColor={{ false: colors.gray, true: colors.darkgray }}
                            thumbColor={vibrate ? colors.blue : colors.darkgray}
                            onValueChange={setVibrate}
                            value={vibrate}
                        />
                    </View>
                </View>
                <View style={theme.option}>
                    <View style={theme.section3}>
                        <Text style={[theme.text, {}]}>通知後に削除する</Text>
                    </View>
                    <View style={theme.section1}>
                        <Switch
                            style={theme.switch}
                            trackColor={{ false: colors.gray, true: colors.darkgray }}
                            thumbColor={autoDelete ? colors.blue : colors.darkgray}
                            onValueChange={setAutoDelete}
                            value={autoDelete}
                        />
                    </View>
                </View>
                <View style={[theme.option, { backgroundColor: colors.gray }]}>
                    <TouchableOpacity style={theme.touch} onPress={() => { setModalVisible(true) }}>
                        <View style={[theme.section2, {}]}>
                            <Text style={[theme.text, { overflow: 'hidden', textOverflow: 'ellipsis', }]}> {summary ? summary : 'ラベルなし'} </Text>
                        </View>
                        <View style={[theme.section1, {}]}>
                            <Text style={[theme.text, { color: colors.darkgray, fontSize: 12 }]}> ラベルを入力してください </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={theme.overlay} />
                </TouchableWithoutFeedback>
                <View style={theme.modalView}>
                    <Text style={theme.title}>アラームラベルを追加</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="入力してください..."
                        value={label}
                        onChangeText={setLabel}
                        autoFocus={modalVisible}
                    />
                    <View style={theme.buttonContainer}>
                        <TouchableOpacity style={[theme.button, { backgroundColor: colors.lightgray }]} onPress={() => setModalVisible(false)}>
                            <Text style={[theme.buttonText, { color: colors.black }]}>キャンセル</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={theme.button}
                            onPress={() => {
                                setSummary(label);
                                setModalVisible(false);
                            }}
                        >
                            <Text style={theme.buttonText}>設定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default AlarmCreator

const theme = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.white,
        width: '90%',
        borderRadius: 15,
        paddingHorizontal: 10
    },
    touch: {
        width: '100%',
        height: '100%',
        flexDirection: 'row'
    },
    label: {
        flex: 1,
        width: '90%',
        borderWidth: 1,
        fontSize: 12,
    },
    section1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    section3: {
        flex: 3,
        justifyContent: 'center',
    },
    section2: {
        flex: 2,
        justifyContent: 'center',
    },
    dateTime: {
        flex: 5,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    date: {
        fontSize: 20,
        margin: 20
    },
    time: {
        fontSize: 20
    },
    text: {
        fontSize: 16,
        color: colors.black
    },
    switch: {

    },

    picker: { flex: 1, width: '100%', height: '100%' },
    overlay: {
        flex: 1,
        backgroundColor: 'black',
        opacity: 0.4,
    },
    modalView: {
        position: 'absolute',
        top: '50%',
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
    title: {
        fontSize: 14,
        marginBottom: 15,
    },
    input: {
        height: 60,
        borderColor: colors.blue,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 15,
        width: '100%',
        padding: 10,
        fontSize: 14
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmButton: {
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    confirm: {
        width: 30,
        height: 30
    },
    button: {
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
        fontSize: 12
    },
})