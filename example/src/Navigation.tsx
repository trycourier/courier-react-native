import React, { useEffect } from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button } from 'react-native';
import { useCourierInbox, useCourierPush } from '@trycourier/courier-react-native';
import InboxCustom from './pages/InboxCustom';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';
import Auth from './pages/Auth';
import Push from './pages/Push';

const Tab = createBottomTabNavigator();

const Navigation = () => {

  // const push = useCourierPush({
  //   iOSForegroundPresentationOptions: ['sound', 'badge', 'list', 'banner']
  // });

  const inbox = useCourierInbox({
    paginationLimit: 100
  });

  // useEffect(() => {

  //   console.log('Notification Permissions');
  //   console.log(push?.notificationPermissionStatus);

  // }, [push?.notificationPermissionStatus]);

  // useEffect(() => {

  //   console.log('Push Tokens');
  //   console.log(push.tokens);

  // }, [push?.tokens]);

  // useEffect(() => {

  //   if (push.delivered) {
  //     console.log(push.delivered);
  //     Alert.alert('📬 Push Notification Delivered', JSON.stringify(push.delivered));
  //   }

  // }, [push.delivered]);

  // useEffect(() => {

  //   if (push.clicked) {
  //     console.log(push.clicked);
  //     Alert.alert('👆 Push Notification Clicked', JSON.stringify(push.clicked));
  //   }

  // }, [push?.clicked]);

  const inboxOptions = (): BottomTabNavigationOptions => {

    const badgeCount = () => {

      if (inbox.error) {
        return undefined;
      }

      return inbox.unreadMessageCount > 0 ? inbox.unreadMessageCount : undefined;

    }

    return {
      headerRight: () => (
        <Button
          onPress={() => inbox?.readAllMessages()}
          title="Read All"
        />
      ),
      tabBarBadge: badgeCount(),
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={'bell'} color={color} size={size} />
      )
    }
  }

  const icon = (icon: string): BottomTabNavigationOptions => {
    return {
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={icon} color={color} size={size} />
      )
    }
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Auth" component={Auth} options={icon('account-circle')} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={inboxOptions()} />
      <Tab.Screen name="Push" component={Push} options={icon('message-badge')} />
      {/* <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} options={inboxOptions()} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={inboxOptions()} />
      <Tab.Screen name="Custom Inbox" component={InboxCustom} options={inboxOptions()} /> */}
    </Tab.Navigator>
  );
};

export default Navigation;
