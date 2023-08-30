import { NavigationContainer } from '@react-navigation/native';
import { CourierInboxProvider } from '@trycourier/courier-react-native';
import * as React from 'react';
import Navigation from './Navigation';

export default function App() {

  // IMPORTANT: Please add `CourierInboxProvider` if you want to access inbox events

  return (
    <CourierInboxProvider> 
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </CourierInboxProvider>
  );

}
