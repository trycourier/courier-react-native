import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import Courier, { CourierInboxView } from 'courier-react-native';

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
      clientKey: 'YWQxN2M2ZmMtNDU5OS00ZThlLWE4NTktZDQ4YzVlYjkxM2Mx',
      userId: 'mike',
    })

    console.log('Current User: ' + await Courier.userId);

  }

  return (
    <View style={styles.container}>
      <CourierInboxView theme={{ color: "#0C356A", cornerRadius: 0 }} style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: '100%',
    height: '100%',
  },
});
