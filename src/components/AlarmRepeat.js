import { months } from 'moment';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Modal,TouchableWithoutFeedback, Image, PermissionsAndroid} from 'react-native';
import { colors } from '../util/color-options';
import { repeatOptions, customDayOptions } from '../util/constants';

const AlarmRepeat = ({ route, navigation }) => {

  const { repeat, setRepeat } = route.params;

  const [selectedOption, setSelectedOption] = useState(repeat.id);
  const [customShow, setCustomShow] = useState(false);
  const [customDays, setCustomDays] = useState(customDayOptions);
  const [value, setValue] = useState(0);

  const [options, setOptions] = useState(repeatOptions);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[theme.option, selectedOption === item.id && theme.selectedOption]}
      onPress={() => {
        setSelectedOption(item.id);
        if (item.id == 3) {
          setCustomShow(true);
        }else{
          setRepeat(item);
        }
      }}
    >
      <View style={theme.optionContent}>
        <Text style={selectedOption === item.id?theme.selectedOptionText:theme.optionText}>{selectedOption === item.id?'✓ ':'   '}{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCustomItem = ({ item }) => (
    <TouchableOpacity
      style={{width: '100%',}}
      onPress={() => {handleCustomChange(item)}}
    >
        <View style={theme.item}>
            <View style={theme.section5}>
                <Text style={theme.optionText}>{item.label}</Text>
            </View>
            <View style={theme.section1}>
                {
                  item.checked?(<Image style={theme.image} source={require('../assets/checked.png')} />)
                  :(<Image style={theme.image} source={require('../assets/unchecked.png')} />)
                }
            </View>
        </View>
    </TouchableOpacity>
  );
  
  const handleCustomInputSubmit = () => {
    if (customDays) {
      setSelectedOption(`カスタム (${customDays})`);
      setCustomDays('');
      setCustomShow(false);
    }
  };

  const handleCustomConfirm = () =>{
    let selectedOptions = [];
    customDays.forEach(option=>{
      if(option.checked) selectedOptions.push(option.id);
    })
    setRepeat({ id: 4, value: selectedOptions, label: `カスタム` });
  }

  const handleCustomChange = (item) => {
    // Toggle the checked state of the item
    const updatedCustomOptions = customDays.map(opt => {
        if (opt.id === item.id) {
            return { ...opt, checked: !opt.checked };
        }
        return opt;
    });
    setCustomDays(updatedCustomOptions);
};

  return (
    <View style={theme.container}>
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={theme.list}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={customShow}
        onRequestClose={() => {
            setCustomShow(!customShow);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setCustomShow(false)}>
            <View style={theme.overlay} />
        </TouchableWithoutFeedback>
        <View style={theme.modalView}>
          <View style={{padding: 20,}}>
            <Text style={[theme.optionText, {fontSize: 18 }]}>カスタマイズ</Text>
          </View>
          <FlatList
              style={{width: '100%', marginBottom: 18}}
              data={customDays}
              renderItem={renderCustomItem}
              keyExtractor={item => item.id}
          />
          <View style={theme.buttonContainer}>
              <TouchableOpacity style={[theme.button, {backgroundColor: colors.lightgray}]} onPress={() => setCustomShow(false)}>
                  <Text style={[theme.buttonText, {color: colors.black}]}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={theme.button}
                  onPress={() => {
                      handleCustomConfirm();
                      setCustomShow(false);
                  }}
              >
                  <Text style={theme.buttonText}>設定</Text>
              </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const theme = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
  },
  list: {
    flexGrow: 1,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
    color: colors.black
  },
  selectedOption: {
    backgroundColor: '#e0e0ff', // Highlight color for selected option
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: colors.black
  },
  selectedOptionText: {
    fontSize: 16,
    color: colors.blue
  },
  tick: {
    color: colors.blue,
    fontSize: 16,
    maxWidth: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '80%',
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'black',
    opacity: 0.4,
  },
  modalView: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: '90%', // Set width as needed
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 10,
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
    fontSize: 18,
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
    fontSize: 18
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
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
    fontSize: 18
  },
  section1:{
    flex: 1,
    justifyContent: 'center'
  },
  section5:{
    flex: 5,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    width: '100%',
    backgroundColor: colors.gray,
  },
});

export default AlarmRepeat;
