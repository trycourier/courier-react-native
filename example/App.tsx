/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import Courier, { CourierPreferencesView } from '@trycourier/courier-react-native';
import {
  StyleSheet,
  View,
} from 'react-native';

function App(): React.JSX.Element {

  useEffect(() => {

    Courier.shared.signIn({
      accessToken: '',
      userId: '',
    });

  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    box: {
      width: '100%',
      height: '100%',
    },
  });
  
  return (
    <View style={styles.container}>
      <CourierPreferencesView 
        mode={{ type: 'topic' }}
        style={styles.box} />
    </View>
  );

}

export default App;
