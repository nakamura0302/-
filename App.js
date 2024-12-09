/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ActivityIndicator,
  PermissionsAndroid, Platform, LogBox
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './src/Screens/Login';
import Home from './src/Screens/Home';
import AlarmCreator from './src/components/AlarmCreator';
import AlarmRepeat from './src/components/AlarmRepeat';
import AlarmRing from './src/components/AlarmRing';
import { colors } from './src/util/color-options';
import { AlarmDatabase } from './src/api/database';

const Stack = createNativeStackNavigator();
LogBox.ignoreAllLogs(true);

function Section({ children, title }) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [firstScreen, setFirstScreen] = useState(""); // Start with null
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const initialize = async () => {

      const userId = await AsyncStorage.getItem('userId');
      setFirstScreen(userId ? 'home' : 'login'); // Set the initial screen
      setIsLoading(false); // Set loading to false after checking

      requestNotificationPermission();
      AlarmDatabase.createTable();
    };

    initialize();

  }, [])
  async function requestNotificationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission",
            message: "This app needs access to your notifications.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the notifications");
        } else {
          console.log("Notification permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }


  if (isLoading) {
  	return (
  		<View style={styles.loadingContainer}>
  			<ActivityIndicator size="large" color="#0000ff" />
  		</View>
  	);
  }

  return (
      <NavigationContainer>
        {/* <StatusBar
				animated={true}
				barStyle="dark-content"
				backgroundColor='white'
				hidden={false}
			/> */}
        <Stack.Navigator initialRouteName={firstScreen} screenOptions={{ navigationBarColor: 'white', textAlign: 'center' }}>
          <Stack.Screen
            name="login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='home'
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="alarm-creator"
            component={AlarmCreator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="alarm-repeat"
            component={AlarmRepeat}
            options={{
              title: '繰り返す',
              headerStyle: {
                backgroundColor: colors.white,
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
              },
              headerTintColor: colors.black,
            }}
          />
          <Stack.Screen
            name="alarm-ring"
            component={AlarmRing}
            options={{
              title: 'アラーム音',
              headerStyle: {
                backgroundColor: colors.white,
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
              },
              headerTintColor: colors.black,
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

});

export default App;
