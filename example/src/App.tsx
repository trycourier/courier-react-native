import { USER_ID, ACCESS_TOKEN } from '@env';
import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';

import * as CourierPush from '@trycourier/courier-react-native';
import { Token, Button } from './components';
import IosForeGroundPreferencesComponent from './components/IosForeGroundPreferencesComponent';

type NotificationType = {
  body: string;
  title: string;
};

const addNotificationListeners = () =>
  CourierPush.registerPushNotificationListeners({
    onNotificationClicked: (notification: NotificationType) => {
      if (notification?.title) {
        showToast(`notification clicked  \n ${notification.title}`);
      }
    },
    onNotificationDelivered: (notification: NotificationType) => {
      console.log('delivered', notification);
      showToast(`notification delivered \n ${notification.title}`);
    },
  });

const showToast = (toastMessage: string) => {
  Alert.alert(toastMessage);
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string | undefined>('');
  const [signedInUserId, setSignedInUserId] = useState<string | undefined>('');
  const [apnsToken, setApnsToken] = useState<string | undefined>('');

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log({ ACCESS_TOKEN, USER_ID });
      const res = await CourierPush.signIn({
        accessToken: ACCESS_TOKEN,
        userId: USER_ID,
      });
      showToast(res);
      setIsSignedIn(true);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const res = await CourierPush.signOut();
      showToast(res);
      setIsSignedIn(false);
      setFcmToken('');
      setSignedInUserId('');
      setApnsToken('');
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPush = async () => {
    try {
      const res = await CourierPush.sendPush({
        authKey: ACCESS_TOKEN,
        userId: USER_ID,
        title: 'This is a title',
        body: 'This is a body',
        providers: [
          Platform.OS === 'ios'
            ? CourierPush.CourierProvider.APNS
            : CourierPush.CourierProvider.FCM,
        ],
        isProduction: !__DEV__,
      });
      showToast(res);
    } catch (err: any) {
      showToast(err);
    }
  };

  const handleGetFcmToken = async () => {
    try {
      const fcmToken = await CourierPush.getFcmToken();
      console.log(fcmToken);
      setFcmToken(fcmToken);
    } catch (err: any) {
      console.log(err);
    }
  };

  const handleGetUserId = async () => {
    try {
      const userId = await CourierPush.getUserId();
      setSignedInUserId(userId);
    } catch (err: any) {
      console.log(err);
    }
  };

  const handleApnsToken = async () => {
    if (Platform.OS === 'ios') {
      try {
        const currentApnsToken = await CourierPush.getApnsToken();
        setApnsToken(currentApnsToken);
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  const init = async () => {
    try {
      const notificationPermissionStatus =
        await CourierPush.getNotificationPermissionStatus();
      console.log('notificationPermissionStatus', notificationPermissionStatus);
      const requestStatus = await CourierPush.requestNotificationPermission();
      showToast(requestStatus);
      handleSignIn();
      const unsubscribeAddNotificationListener = addNotificationListeners();
      const unsubscribeDebugListener = CourierPush.debuggerListener();
      return () => {
        unsubscribeAddNotificationListener();
        unsubscribeDebugListener();
      };
    } catch (e: any) {
      console.log(e);
      showToast(e);
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

  if (isLoading)
    return (
      <View style={styles.container}>{isLoading && <ActivityIndicator />}</View>
    );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Button
          title="Start Debugging"
          onPress={() => {
            if (Platform.OS === 'android') {
              CourierPush.setDebugMode(true);
            }
          }}
        />
        <Button
          title="Stop Debugging"
          onPress={() => {
            if (Platform.OS === 'android') {
              CourierPush.setDebugMode(false);
            }
          }}
        />
      </View>
      <Text style={styles.signInStatus}>
        {isSignedIn ? 'Signed In' : 'Not Signed In'}
      </Text>
      {isSignedIn ? (
        <Button title="Sign out" onPress={handleSignOut} />
      ) : (
        <Button title="Sign in" onPress={handleSignIn} />
      )}
      {isSignedIn && (
        <>
          <Button title="Send Push" onPress={handleSendPush} />
          <IosForeGroundPreferencesComponent />
        </>
      )}
      <Button title="Get Fcm Token" onPress={handleGetFcmToken} />
      <Button title="Get User Id" onPress={handleGetUserId} />
      {Platform.OS === 'ios' && (
        <Button title="Get APNS token" onPress={handleApnsToken} />
      )}
      <Token title="fcm Token" token={fcmToken} />
      <Token title="User Id" token={signedInUserId} />
      {Platform.OS === 'ios' && <Token title="Apns Token" token={apnsToken} />}
    </View>
  );
}

const styles = StyleSheet.create({
  signInStatus: {
    backgroundColor: 'black',
    color: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    padding: 12,
    backgroundColor: '#008CBA',
    borderRadius: 4,
    margin: 12,
  },
  buttonTextStyle: {
    color: 'white',
  },
});
