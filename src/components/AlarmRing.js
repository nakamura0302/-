import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../util/color-options'; // Adjust this import based on your project structure
import { rings } from '../util/constants';

const AlarmRing = ({ route, navigation }) => {

  const {ring, setRing} = route.params;

  const [selectedRing, setSelectedRing] = useState(ring);

  const handleSelectRing = (value) => {
    // Handle the selection of the ring here, e.g., set it in state or navigate
    setRing(value);
    setSelectedRing(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rings.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, item.value == selectedRing.value && styles.selected]} 
            onPress={() => handleSelectRing(item)}
          >
            <Image style={styles.image} source={item.imagePath} />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', // Adjust width for two columns
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selected:{
    borderWidth: 2,
    borderColor: colors.blue
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AlarmRing;
