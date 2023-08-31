import { NavigationContainer } from '@react-navigation/native';
import Courier, { CourierInboxProvider } from '@trycourier/courier-react-native';
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import Navigation from './Navigation';

export default function App() {

  useEffect(() => {

    const unsubscribeNotificationListeners = Courier.shared.registerPushNotificationListeners({
      onPushNotificationClicked: (push) => {
        Alert.alert(`Push Clicked\n${JSON.stringify(push)}`);
      },
      onPushNotificationDelivered: (push) => {
        Alert.alert(`Push Delivered\n${JSON.stringify(push)}`);
      },
    });

    return () => {
      unsubscribeNotificationListeners();
    }

  }, []);

  // IMPORTANT: Please add `CourierInboxProvider` if you want to access inbox events

  return (
    <CourierInboxProvider> 
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </CourierInboxProvider>
  );

}
