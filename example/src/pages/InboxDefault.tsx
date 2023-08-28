import Courier, { CourierInboxView } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

const InboxDefault = () => {

  React.useEffect(() => {
    test();
  }, []);

  async function test() {

    console.log('Initial User: ' + await Courier.shared.userId);

    const isDebugging = Courier.shared.isDebugging;
    console.log(isDebugging);

    try {

      await Courier.shared.signIn({
        accessToken: 'pk_prod_2M1VP0GVFE4M0RQ4ZYFW1DGH3R90',
        clientKey: 'YWQxN2M2ZmMtNDU5OS00ZThlLWE4NTktZDQ4YzVlYjkxM2Mx',
        userId: 'mike',
      })

    } catch (e) {

      console.error(e)

    }

    console.log('Current User: ' + await Courier.shared.userId);

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
          message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId })
        }}
        onClickInboxActionForMessageAtIndex={(action, message, index) => {
          console.log(action)
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxDefault;