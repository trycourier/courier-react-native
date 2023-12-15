import Courier, { CourierPushProvider } from '@trycourier/courier-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';

const Push = () => {

  const [tokens, setTokens] = useState<Map<string, string>>(new Map());

  useEffect(() => {

    setExampleToken();

  }, []);

  const refreshTokens = () => {

    const pushProviderValues = Object.values(CourierPushProvider);
    const tokensMap = new Map<string, string>();

    for (const provider of pushProviderValues) {
      const token = Courier.shared.getTokenForProvider({ provider: provider });
      if (token) {
        tokensMap.set(provider, token);
      }
    }

    setTokens(tokensMap);

  }

  const setExampleToken = async () => {

    const requestStatus = await Courier.shared.requestNotificationPermission();
    console.log('Request Notification Status: ' + requestStatus);
    console.log('Get Notification Status: ' + await Courier.shared.getNotificationPermissionStatus());

    // Example of setting an expo token
    await Courier.shared.setTokenForProvider({
      provider: CourierPushProvider.EXPO,
      token: 'example_expo_token'
    });

    refreshTokens();

  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: 20,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    button: {
      backgroundColor: 'lightgray',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      fontSize: 16,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    keyText: {
      flex: 1,
      textAlign: 'left',
    },
    valueText: {
      flex: 1,
      textAlign: 'right',
    },
  });

  const handleCopyToClipboard = (value: string) => {
    Clipboard.setString(value);
  };

  const handleButtonPress = () => {
    Courier.shared.requestNotificationPermission();
  };
  
  return (
    <View style={styles.container}>
      {[...tokens.entries()].map(([key, value]) => (
        <TouchableOpacity key={key} onPress={() => handleCopyToClipboard(value)} style={styles.itemContainer}>
          <Text style={styles.keyText}>{key}</Text>
          <Text style={styles.valueText}>{value}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.button} onPress={refreshTokens}>
        <Text style={styles.buttonText}>Refresh Tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>Request Permissions</Text>
      </TouchableOpacity>
    </View>
  );

};

export default Push;