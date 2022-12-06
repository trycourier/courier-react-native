import { USER_ID, ACCESS_TOKEN } from '@env';
import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  Alert,
  Button,
} from 'react-native';

import Courier, { CourierProvider } from '@trycourier/courier-react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import DarkModeText from './components/DarkModeText';
import IosForegroundPreferencesComponent from './components/IosForeGroundPreferencesComponent';
import { allProvidersEnumMappedValues } from './utils/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'lightgray',
  },
  textDark: {
    color: 'white',
  },
  textLight: {
    color: 'dark',
  },
  providersContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerCheckbox: {
    margin: 8,
    alignSelf: 'flex-start',
  },
});

const showToast = (message: string) => {
  Alert.alert(message);
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courierUserId, setCourierUserId] = useState<string | undefined>();
  const [isDebugging, setIsDebugging] = useState<boolean>(__DEV__);
  const [selectedProviders, setSelectedProviders] = useState<CourierProvider[]>(
    []
  );

  const handleProviderChange = (selectedProvider: CourierProvider) => {
    let updatedSelectedProviders: CourierProvider[] = [];
    if (selectedProviders.includes(selectedProvider)) {
      updatedSelectedProviders = selectedProviders.filter(
        (provider) => provider !== selectedProvider
      );
    } else {
      updatedSelectedProviders = [...selectedProviders, selectedProvider];
    }
    setSelectedProviders(updatedSelectedProviders);
  };

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
      const fcmToken = await Courier.fcmToken;
      console.log('fcmToken', fcmToken);

      setCourierUserId(undefined);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPush = async () => {
    const messageProviders = selectedProviders.join('and');
    try {
      const messageId = await Courier.sendPush({
        authKey: ACCESS_TOKEN,
        userId: USER_ID,
        title: `Hey ${USER_ID}`,
        body: `This is a test push sent through ${messageProviders}`,
        providers: selectedProviders,
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

      const unsubscribeNotificationListeners =
        Courier.registerPushNotificationListeners({
          onPushNotificationClicked(push) {
            showToast(`Push Clicked\n${JSON.stringify(push)}`);
          },
          onPushNotificationDelivered(push) {
            showToast(`Push Delivered\n${JSON.stringify(push)}`);
          },
        });

      const userId = await Courier.userId;
      setCourierUserId(userId);

      setIsDebugging(Courier.isDebugging);

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
    return () => {
      // dummy empty function
    };
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setSelectedProviders([CourierProvider.APNS]);
    } else {
      setSelectedProviders([CourierProvider.FCM]);
    }

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
      const debugging = await Courier.setIsDebugging(!isDebugging);
      setIsDebugging(debugging);
    }

    if (isDebugging) {
      return (
        <Button title="Stop Debugging" onPress={() => toggleDebugging()} />
      );
    }
    return <Button title="Start Debugging" onPress={() => toggleDebugging()} />;
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
          {Platform.OS === 'ios' && (
            <>
              <View style={styles.divider} />
              <IosForegroundPreferencesComponent />
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.providersContainer}>
            <DarkModeText text="Select Providers" />
            {allProvidersEnumMappedValues.map((provider) => (
              <View style={styles.providerCheckbox} key={provider.value}>
                <BouncyCheckbox
                  text={provider.name}
                  isChecked={selectedProviders.includes(provider.value)}
                  onPress={() => {
                    handleProviderChange(provider.value);
                  }}
                />
              </View>
            ))}
          </View>
          <Button
            title="Send Push"
            onPress={handleSendPush}
            disabled={selectedProviders.length === 0}
          />
          <View style={styles.divider} />
          <Button title="See FCM Token" onPress={handleGetFcmToken} />
          <Button title="See APNS token" onPress={handleApnsToken} />
          {buildDebugging()}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <DarkModeText text="No User is signed into Courier" />
        <Button title="Sign In" onPress={handleSignIn} />
        <View style={styles.divider} />
        <Button title="See FCM Token" onPress={handleGetFcmToken} />
        <Button title="See APNS token" onPress={handleApnsToken} />
        <View style={styles.divider} />
        {buildDebugging()}
      </View>
    );
  }

  return buildContent();
}
