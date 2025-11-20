import { CourierInboxView } from '@trycourier/courier-react-native';
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

  const lightTheme = {
    tabIndicatorColor: '#000000',
  }

  const darkTheme = {
    tabIndicatorColor: '#FFFFFF',
  }
  
  return (
    <View style={styles.container}>
      <CourierInboxView
        theme={{
          light: lightTheme,
          dark: darkTheme,
        }}
        onClickInboxMessageAtIndex={async (message, _index) => {
          message.isRead ? await message.markAsUnread() : await message.markAsRead()
        }}  
        onClickInboxActionForMessageAtIndex={(action, _message, _index) => {
          console.log(action)
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxDefault;