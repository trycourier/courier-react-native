import React from 'react';
import { StyleSheet, Text, useColorScheme } from 'react-native';

const styles = StyleSheet.create({
  light: {
    color: '#000',
  },
  dark: {
    color: '#fff',
  },
});

function DarkModeText({ text }: { text: string }) {
  const colorScheme = useColorScheme();

  return (
    <Text style={colorScheme === 'dark' ? styles.dark : styles.light}>
      {text}
    </Text>
  );
}

export default DarkModeText;
