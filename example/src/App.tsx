import { ACCESS_TOKEN, CLIENT_KEY } from '@env';
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

import DarkModeText from './components/DarkModeText';
import UserInputModal from './components/UserInputModal';
import { allIOSPresentationOptions, allProviders } from './utils/constants';
import List, { ListItem } from './components/List';

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
  const [isUserInputModalOpen, setIsUserInputModalOpen] = useState(false);
  const showUserInputModal = () => setIsUserInputModalOpen(true);
  const hideUserInputModal = () => setIsUserInputModalOpen(false);
  const [selectedProviders, setSelectedProviders] =
    useState<ListItem[]>(allProviders);
  const [selectedIosPreferences, setSelectedIosPreferences] = useState<
    ListItem[]
  >(allIOSPresentationOptions);

  const handleProviderChange = (selectedProvider: ListItem) => {
    let updatedItems: ListItem[] = [];

    if (selectedProviders.includes(selectedProvider)) {
      updatedItems = selectedProviders.filter(
        (provider) => provider !== selectedProvider
      );
    } else {
      updatedItems = [...selectedProviders, selectedProvider];
    }

    setSelectedProviders(updatedItems);
  };

  const handleIosPreferenceChange = (selectedPreference: ListItem) => {
    let updatedItems: ListItem[] = [];

    if (selectedIosPreferences.includes(selectedPreference)) {
      updatedItems = selectedIosPreferences.filter(
        (provider) => provider !== selectedPreference
      );
    } else {
      updatedItems = [...selectedIosPreferences, selectedPreference];
    }

    // Tell Courier to change the presentation options
    // This can be awaited, but we are skipping it here
    Courier.iOSForegroundPresentationOptions({
      options: updatedItems.map((item) => item.value),
    });

    setSelectedIosPreferences(updatedItems);
  };

  const handleSignIn = async (userId: string) => {
    console.log('New user id');
    console.log(userId);

    try {

      setIsLoading(true);

      await Courier.signIn({
        accessToken: ACCESS_TOKEN,
        clientKey: CLIENT_KEY,
        userId: userId,
      });

      const newUserId = await Courier.userId;
      setCourierUserId(newUserId);
      hideUserInputModal();

    } catch (e) {
      console.error(e);
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
      if (courierUserId) {
        const messageId = await Courier.sendPush({
          authKey: ACCESS_TOKEN,
          userId: courierUserId,
          title: `Hey ${courierUserId}`,
          body: `This is a test push sent to ${selectedProviders
            .map((provider) => provider.name)
            .join(' and ')}`,
          providers: selectedProviders.map((provider) => provider.value),
        });

        showToast(`Message sent. Message id: ${messageId}`);
      }
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
      setSelectedProviders(
        allProviders.filter((item) => {
          return item.value === CourierProvider.APNS;
        })
      );
    } else {
      setSelectedProviders(
        allProviders.filter((item) => {
          return item.value === CourierProvider.FCM;
        })
      );
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
              <List
                title="iOS Foreground Notification Presentation Styles"
                items={allIOSPresentationOptions}
                selectedItems={selectedIosPreferences}
                onItemClick={handleIosPreferenceChange}
              />
            </>
          )}

          {/* TODO Get working */}
          <CourierInboxView style={{ flex: 1 }} />

          <View style={styles.divider} />
          <List
            title="Providers"
            items={allProviders}
            selectedItems={selectedProviders}
            onItemClick={handleProviderChange}
          />
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
      <>
        <UserInputModal
          open={isUserInputModalOpen}
          onClose={hideUserInputModal}
          onOkay={handleSignIn}
        />

        <View style={styles.container}>
          <DarkModeText text="No User is signed into Courier" />
          <Button title="Sign In" onPress={showUserInputModal} />
          <View style={styles.divider} />
          <Button title="See FCM Token" onPress={handleGetFcmToken} />
          <Button title="See APNS token" onPress={handleApnsToken} />
          <View style={styles.divider} />
          {buildDebugging()}
        </View>
      </>
    );
  }

  return buildContent();
}
