import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

type PropType = {
  onPress: () => void;
  title: string;
};
const Button = ({ onPress, title }: PropType) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonStyle}>
      <Text style={styles.buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    padding: 12,
    backgroundColor: '#008CBA',
    borderRadius: 4,
    margin: 12,
    alignItems: 'center',
  },
  buttonTextStyle: {
    color: 'white',
  },
});

export default Button;
