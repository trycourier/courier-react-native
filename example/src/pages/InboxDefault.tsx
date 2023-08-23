import Courier, { CourierInboxView } from 'courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CourierInboxTheme from 'src/models/CourierInboxTheme';

const InboxDefault = () => {

  React.useEffect(() => {
    test();
  }, []);

  async function test() {

    console.log('Initial User: ' + await Courier.userId);

    const isDebugging = Courier.isDebugging;
    console.log(isDebugging);

    try {

      await Courier.signIn({
        accessToken: 'pk_prod_2M1VP0GVFE4M0RQ4ZYFW1DGH3R90',
        clientKey: 'YWQxN2M2ZmMtNDU5OS00ZThlLWE4NTktZDQ4YzVlYjkxM2Mx',
        userId: 'mike',
      })

    } catch (e) {

      console.error(e)

    }

    console.log('Current User: ' + await Courier.userId);

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
  
  return (
    <View style={styles.container}>
      <CourierInboxView
        onClickInboxMessageAtIndex={(message, index) => {
          console.log(message)
        }}
        onClickInboxActionForMessageAtIndex={(action, message, index) => {
          console.log(action)
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxDefault;