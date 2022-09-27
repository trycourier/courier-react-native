import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import * as CourierPush from '@trycourier/courier-react-native';
import { userId, authToken } from './config/constants';
import { Token, Button } from './components';

const showToast = (toastMessage: string) => {
  ToastAndroid.showWithGravity(
    toastMessage,
    ToastAndroid.SHORT,
    ToastAndroid.CENTER
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [fcmToken, setFcmToken] = useState<string>('');
  const [signedInUserId, setSignedInUserId] = useState<string>('');

  const handleSignIn = () => {
    setIsLoading(true);
    CourierPush.signIn({ userId, authToken })
      .then((res) => {
        showToast(res);
        setIsSignedIn(true);
      })
      .catch(console.log)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSignOut = () => {
    setIsLoading(true);
    CourierPush.signOut()
      .then((res) => {
        showToast(res);
        setIsSignedIn(false);
        setFcmToken('');
        setSignedInUserId('');
      })
      .catch(console.log)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSendPush = () => {
    CourierPush.sendPush({ authKey: authToken, userId })
      .then(showToast)
      .catch(showToast);
  };

  const handleGetFcmToken = () => {
    CourierPush.getFcmToken().then(setFcmToken).catch(console.log);
  };

  const handleGetUserId = () => {
    CourierPush.getFcmToken().then(setSignedInUserId).catch(console.log);
  };

  useEffect(() => {
    handleSignIn();
    CourierPush.onNotificationDelivered((notification) => {
      console.log('delivered', notification);
    });
    CourierPush.onNotificationClicked((notification) => {
      console.log('clicked', notification);
    });
    return CourierPush.unsubscribe;
  }, []);

  if (isLoading)
    return (
      <View style={styles.container}>{isLoading && <ActivityIndicator />}</View>
    );

  return (
    <View style={styles.container}>
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
          <View>
            <Button title="Send Push" onPress={handleSendPush} />
            <Button title="Get Fcm Token" onPress={handleGetFcmToken} />
            <Button title="Get User Id" onPress={handleGetUserId} />
          </View>
          <Token title="fcm Token" token={fcmToken} />
          <Token title="User Id" token={signedInUserId} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  signInStatus: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    margin: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  divider: {
    marginVertical: 12,
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
