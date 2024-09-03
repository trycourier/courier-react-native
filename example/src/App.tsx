import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import Home from './Home';
import Toast from 'react-native-toast-message';
import { TouchVisualizer } from './Poke';

export default function App() {

  return (
    <TouchVisualizer>
      <NavigationContainer>
        <Home />
        <Toast />
      </NavigationContainer>
    </TouchVisualizer>
  );

}
