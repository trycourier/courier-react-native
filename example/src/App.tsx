import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import Courier, { CourierReactNativeView } from 'courier-react-native';

export default function App() {
  
  React.useEffect(() => {
    test();
  }, []);

  async function test() {

    console.log('Initial User: ' + await Courier.userId);

    const isDebugging = Courier.isDebugging;
    console.log(isDebugging);

    await Courier.signIn({
      accessToken: 'pk_prod_2M1VP0GVFE4M0RQ4ZYFW1DGH3R90',
      clientKey: 'Something',
      userId: 'mike',
    })

    console.log('Current User: ' + await Courier.userId);

  }

  return (
    <View style={styles.container}>
      <CourierReactNativeView color="#32a852" style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
