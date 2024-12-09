import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    Image,
    TextInput,
    KeyboardAvoidingView,
    ToastAndroid,
    AppState
} from 'react-native';
import LoginButton from '../components/buttons/LoginButton';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../util/color-options';

const scale = 1.5;

const Login = ({ navigation }) => {
    const [appState, setAppState] = useState(AppState.currentState);

    // const [password, setPassword] = useState('');
    // const [email, setEmail] = useState('');
    const [password, setPassword] = useState('Fukurou187');
    const [email, setEmail] = useState('takashi@komaeda.com');

    function isEmail(str) {
        // Regular expression for validating an email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(str);
    }

    async function handleAuthClick() {
        if (!email) {
            ToastAndroid.show('メールアドレスを入力してください', ToastAndroid.SHORT);
            return;
        } else if (!isEmail(email)) {
            ToastAndroid.show('メールアドレスを正しく入力してください', ToastAndroid.SHORT);
            return;
        } else if (password == '') {
            ToastAndroid.show('パスワードを入力してください', ToastAndroid.SHORT);
            return;
        }
        try {
            const response = await fetch(`https://logi-attendance.new-challenge.jp/api/calendar/check?email=${email}&password=${password}`);
            const res = await response.json();
            console.log(res);
            if (!res.uid) {
                ToastAndroid.show('メールアドレスとパスワードを再度ご確認ください', ToastAndroid.SHORT);
            } else {
                console.log(res.uid);
                AsyncStorage.setItem('userId', res.uid);
                setEmail('');
                setPassword('');
                navigation.push('home');
            }
        } catch (error) {
            ToastAndroid.show('サーバーに接続できません', ToastAndroid.SHORT);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled={false}
        >
            <View style={theme.container}>
                <View style={theme.content} >
                    <Image style={theme.illustration} source={require('../assets/illustration.png')} />
                    <Text style={[theme.title, { fontFamily: 'opensansBold' }]}>Logiアラーム</Text>
                    <Text style={[theme.text, { fontFamily: 'opensansRegular' }]}>目覚まし時計で時間を管理する</Text>

                    <TextInput
                        keyboardType="email-address"
                        style={[theme.email]}
                        placeholder="メールアドレス"
                        value={email}
                        onChangeText={e => { setEmail(e) }}
                    />
                    <TextInput
                        style={[theme.password]}
                        placeholder="パスワード"
                        value={password}
                        onChangeText={e => { setPassword(e) }}
                        secureTextEntry={true}
                    />
                    <LoginButton title={'ログイン'} onPress={() => handleAuthClick()} />
                </View>
                <StatusBar style="auto" />
                <Text style={[theme.lettermark, { bottom: 85 }]}>Logiチーム</Text>
            </View>
        </KeyboardAvoidingView>
    )
}

const theme = StyleSheet.create({
    container: { flex: 1, height: '100%', backgroundColor: colors.gray, justifyContent: 'center', alignItems: 'center' },
    lettermark: { fontSize: 12, color: colors.darkgray, position: 'absolute' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    illustration: { width: 275 / scale, height: 150 / scale, },
    title: { fontSize: 32, textAlign: 'center', margin: 20, color: colors.black },
    text: { fontSize: 16, marginBottom: 50, textAlign: 'center', color: colors.darkgray },
    email: {
        fontSize: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.darkgray,
        height: 45,
        width: 200,
    },
    password: {
        fontSize: 15,
        marginBottom: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors.darkgray,
        height: 45,
        width: 200,
    },
})

export default Login;