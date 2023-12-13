import { NavigationContainer } from '@react-navigation/native';
import { CourierProvider } from '@trycourier/courier-react-native';
import React from 'react';
import Navigation from './Navigation';

export default function App() {

  // IMPORTANT: Please add `CourierProvider` if you want to access realtime Courier events

  return (
    <CourierProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </CourierProvider>
  );

}
