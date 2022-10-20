import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";

const DarkModeText = (props: { text: string }) => {

  const colorScheme = useColorScheme();
  
  return (
    <Text style={colorScheme === 'dark' ? styles.dark : styles.light}>
      {props.text}
    </Text>
  );
  
};

const styles = StyleSheet.create({
  light: {
    color: '#000',
  },
  dark: {
    color: '#fff',
  },
});

export default DarkModeText;