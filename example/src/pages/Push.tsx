import Courier, { CourierPushProvider } from '@trycourier/courier-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, ActivityIndicator, Platform } from 'react-native';

const Push = () => {

  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState<Map<string, string>>(new Map());

  useEffect(() => {

    setExampleToken();

  }, []);

  const refreshTokens = async () => {
    const tokensMap = await Courier.shared.getAllTokens();
    setTokens(tokensMap);
  }

  const setExampleToken = async () => {

    setIsLoading(true);

    const requestStatus = await Courier.requestNotificationPermission();
    console.log('Request Notification Status: ' + requestStatus);
    console.log('Get Notification Status: ' + await Courier.getNotificationPermissionStatus());

    // Example of setting an expo token
    await Courier.shared.setTokenForProvider({
      provider: CourierPushProvider.EXPO,
      token: 'example_expo_token'
    });

    setIsLoading(false);

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
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        default: 'monospace',
      }),
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
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        default: 'monospace',
      }),
      fontWeight: 'bold',
      fontSize: 16,
    },
    valueText: {
      flex: 1,
      textAlign: 'right',
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        default: 'monospace',
      }),
      fontSize: 16,
    },
  });

  const handleCopyToClipboard = (value: string) => {
    Clipboard.setString(value);
  };

  const handleButtonPress = () => {
    Courier.requestNotificationPermission();
  };
  
  return (
    <View style={styles.container}>

      {isLoading && (
        <ActivityIndicator size="small" />
      )}

      {!isLoading && (
        <>
          {Array.from(tokens).map(([key, value]) => (
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
        </>
      )}

    </View>
  );

};

export default Push;