import { USER_ID, ACCESS_TOKEN } from '@env';
import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
  Alert,
  Button,
} from 'react-native';

import Courier, { CourierProvider } from '@trycourier/courier-react-native';
import IosForegroundPreferencesComponent from './components/IosForegroundPreferencesComponent';
import DarkModeText from './components/DarkModeText';

const showToast = (message: string) => {
  Alert.alert(message);
};

export default function App() {

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courierUserId, setCourierUserId] = useState<string | undefined>();
  const [isDebugging, setIsDebugging] = useState<boolean>(__DEV__);

  const handleSignIn = async () => {

    try {

      setIsLoading(true);

      await Courier.signIn({
        accessToken: ACCESS_TOKEN,
        userId: USER_ID,
      });

      const userId = await Courier.userId;
      setCourierUserId(userId);

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }

  };

  const handleSignOut = async () => {

    try {

      setIsLoading(true);

      await Courier.signOut();

      setCourierUserId(undefined);

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }

  };

  const handleSendPush = async () => {

    try {

      const providers = [ Platform.OS === 'ios' ? CourierProvider.APNS : CourierProvider.FCM ]

      const messageId = await Courier.sendPush({
        authKey: ACCESS_TOKEN,
        userId: USER_ID,
        title: 'This is a title',
        body: 'This is a body',
        providers: providers,
        isProduction: !__DEV__,
      });

      showToast(`Message sent. Message id: ${messageId}`);

    } catch (e) {
      console.log(e);
    }

  };

  const handleGetFcmToken = async () => {
    try {
      const token = await Courier.fcmToken;
      showToast(`FCM Token: ${token}`);
      console.log(token);
    } catch (e) {
      console.log(e);
    }
  };

  const handleApnsToken = async () => {
    try {
      const token = await Courier.apnsToken;
      showToast(`APNS Token: ${token}`);
      console.log(token);
    } catch (e) {
      console.log(e);
    }
  };

  const init = async () => {

    try {

      setIsLoading(true);

      const unsubscribeNotificationListeners = Courier.registerPushNotificationListeners({
        onPushNotificationClicked(push) {
          showToast(`Push Clicked\n${JSON.stringify(push)}`);
        },
        onPushNotificationDelivered(push) {
          showToast(`Push Delivered\n${JSON.stringify(push)}`);
        },
      });

      const userId = await Courier.userId;
      setCourierUserId(userId);

      const isDebugging = Courier.isDebugging;
      setIsDebugging(isDebugging);

      setIsLoading(false);

      const getStatus = await Courier.notificationPermissionStatus;
      console.log('Get notification status:', getStatus);

      const requestStatus = await Courier.requestNotificationPermission();
      console.log('Request notification permission:', requestStatus);

      return () => {
        unsubscribeNotificationListeners();
      };

    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      unsubscribe = await init();
    })();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  function buildDebugging() {

    async function toggleDebugging() {
      const debugging = await Courier.setIsDebugging(!isDebugging)
      setIsDebugging(debugging)
    }

    if (isDebugging) {
      return <Button
        title="Stop Debugging"
        onPress={() => toggleDebugging()}
      />
    } else {
      return <Button
        title="Start Debugging"
        onPress={() => toggleDebugging()}
        />
    }

  }

  function buildContent() {

    if (isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      );
    }

    if (courierUserId) {
      return (
        <View style={styles.container}>
          <DarkModeText text={`Current User Id: ${courierUserId}`} />
          <Button title="Sign Out" onPress={handleSignOut} />
          <View style={styles.divider} />
          <IosForegroundPreferencesComponent />
          <Button title="Send Push" onPress={handleSendPush} />
          <View style={styles.divider} />
          <Button title="See FCM Token" onPress={handleGetFcmToken} />
          <Button title="See APNS token" onPress={handleApnsToken} />
          {buildDebugging()}
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <DarkModeText text={'No User is signed into Courier'} />
        <Button title="Sign In" onPress={handleSignIn} />
        <View style={styles.divider} />
        <Button title="See FCM Token" onPress={handleGetFcmToken} />
        <Button title="See APNS token" onPress={handleApnsToken} />
        <View style={styles.divider} />
        {buildDebugging()}
      </View>
    )

  }

  return buildContent();

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'lightgray'
  },
  textDark: {
    color: 'white'
  },
  textLight: {
    color: 'dark'
  }
});
