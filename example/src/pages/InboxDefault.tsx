import Courier, { CourierInboxView } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

const InboxDefault = () => {

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