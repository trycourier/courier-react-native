import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Home from './Home';
import Toast from 'react-native-toast-message';
import { Poke } from './Poke';

export default function App() {

  return (
    <Poke initialEnabled={false}>
      <NavigationContainer>
        <Home />
        <Toast />
      </NavigationContainer>
    </Poke>
  );

}
