import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../util/color-options';

const CreateButton = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Image style={{width: 20, height: 20}} source={require('../../assets/plus.png')}/>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 30,
        right: 15,
        elevation: 7,
        backgroundColor: '#dde2f9'
    }
});

export default CreateButton;