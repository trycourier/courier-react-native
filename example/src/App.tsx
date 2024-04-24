import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Home from './Home';
import Toast from 'react-native-toast-message';

export default function App() {

  return (
    <NavigationContainer>
      <Home />
      <Toast />
    </NavigationContainer>
  );

}
