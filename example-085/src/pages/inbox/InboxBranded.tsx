import { CourierInboxView } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Env from '../../Env';

const InboxBranded = () => {
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
        theme={{
          light: { brandId: Env.brandId },
          dark: { brandId: Env.brandId },
        }}
        onClickInboxMessageAtIndex={async (message, _index) => {
          message.isRead
            ? await message.markAsUnread()
            : await message.markAsRead();
        }}
        onClickInboxActionForMessageAtIndex={(action, _message, _index) => {
          console.log(action);
        }}
        style={styles.box}
      />
    </View>
  );
};

export default InboxBranded;
