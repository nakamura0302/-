import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MenuDrawer from 'react-native-side-drawer';
import Checkbox from '@react-native-community/checkbox';

const Sidebar = (props) => {

  const onModeClick = (item) => {
    props.setViewMode(item.value);
    props.setSidebarVisible(false);
  }

  const onRefresh = async () => {
    props.setSidebarVisible(false);
    props.refresh();
  }

  const onCalendarCheckedChange = (changedItem) => {
    const updatedCalendars = props.calendars.map(item => {
      if (item.id == changedItem.id) {
        return { ...item, checked: !item.checked };
      } else {
        return item;
      }
    })
    props.setCalendars(updatedCalendars);
  }

  const drawerContent = () => {
    return (
      <TouchableOpacity  style={styles.container} onPress={() => { props.setSidebarVisible(false) }}>
        <ScrollView style={styles.drawerContent}>
          <View style={[styles.title]} key={'title'}>
            <Text style={{ fontSize: 16 }}>Logiカレンダー</Text>
            <TouchableOpacity onPress={() => { props.setSidebarVisible(false) }}>
              <Image style={[styles.icon]} source={require('../assets/arrow-back.png')} />
            </TouchableOpacity>
          </View>
          {
            props.viewModes.map(item => {
              return (
                <TouchableOpacity key={`mode${item.id}`} style={[styles.option, { backgroundColor: props.viewMode === item.value ? '#dde2f9' : 'transparent' }]} onPress={() => { onModeClick(item) }}>
                  <Image style={[styles.icon]} source={item.icon} />
                  <Text style={[styles.optionText, {}]}>{item.label}</Text>
                </TouchableOpacity>
              )
            })
          }
          <TouchableOpacity key={`refresh`} style={[styles.refresh]} onPress={() => { onRefresh() }}>
            <Image style={[styles.icon]} source={require('../assets/refresh.png')} />
            <Text style={[styles.optionText, {}]}>リフレッシュ</Text>
          </TouchableOpacity>
          {
            props.calendars.map(item => {
              return (
                <TouchableOpacity key={`calendar${item.id}`} style={[styles.option]} onPress={() => { onCalendarCheckedChange(item) }}>
                  <Checkbox
                    value={item.checked}
                    onValueChange={() => { onCalendarCheckedChange(item) }}
                    color={item.backColor}
                  />
                  <Text style={[styles.optionText]}>{item.title}</Text>
                </TouchableOpacity>)
            })
          }
        </ScrollView>
        <TouchableOpacity  style={styles.otherView} onPress={() => { props.setSidebarVisible(false) }}>

        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <MenuDrawer
      open={props.sidebarVisible}
      position={'left'}
      drawerContent={drawerContent()}
      drawerPercentage={100}
      animationTime={250}
      overlay={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
    height: '100%',
    width: '100%',
    flexDirection: 'row'
  },
  drawerContent: {
    zIndex: 10,
    height: '100%',
    width: '80%',
    backgroundColor: 'white',
    opacity:1
  },
  otherView:{
    height: '100%',
    width: '20%',
    backgroundColor: 'gray',
    opacity: 0.7
  },
  animatedBox: {
    flex: 1,
    backgroundColor: "#38C8EC",
    padding: 10
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F04812'
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 80,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  option: {
    flexDirection: 'row',
    width: '95%',
    paddingHorizontal: 20,
    paddingVertical: 5,
    height: 40,
    alignItems: 'center',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  optionText: {
    fontSize: 14,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  refresh: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    height: 50,
    borderColor: 'lightgray',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center'
  },
  icon: {
    width: 24,
    height: 24
  }
});

export default Sidebar;
