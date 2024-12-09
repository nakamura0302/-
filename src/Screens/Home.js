import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alarm from '../components/Alarm';
import MyCalendar from '../components/Calendar';

const CustomHeader = ({ navigation, title }) => {

    const logout = () => {
      AsyncStorage.clear();
      navigation.push('login');
    }
  
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'white' }}>
            <View style={{ paddingLeft: 20 }}>
                <Text></Text>
            </View>
            <View style={{ justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{title}</Text>
            </View>
            <View style={{ justifyContent: 'center', paddingRight: 10 }}>
                <TouchableOpacity onPress={() => logout()}>
                    <Image style={{ width: 20, height: 20 }} source={require('../assets/logout.png')} />
                </TouchableOpacity>
            </View>
        </View>
    );
  };

const Tab = createBottomTabNavigator();

export default function Home({ navigation }) {

    return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let icon;

                        if (route.name === 'アラーム') {
                            icon = focused
                                ? <Image style={{width: 20, height: 20}} source={require('../assets/clock.png')}/>
                                : <Image style={{width: 20, height: 20}} source={require('../assets/clock.png')}/>
                        } else if (route.name === 'カレンダー') {
                            icon = focused
                                ? <Image style={{width: 20, height: 20}} source={require('../assets/calendar.png')}/>
                                : <Image style={{width: 20, height: 20}} source={require('../assets/calendar.png')}/>
                        }

                        // You can return any component that you like here!
                        return icon;
                    },
                    tabBarActiveTintColor: 'black',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen
                    name="カレンダー"
                    component={MyCalendar}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} title={'カレンダー'} />,
                    })}
                />
                <Tab.Screen
                    name="アラーム"
                    component={Alarm}
                    options={({ navigation }) => ({
                        header: () => <CustomHeader navigation={navigation} title={'アラーム'} />,
                    })}
                />

            </Tab.Navigator>
    )
}