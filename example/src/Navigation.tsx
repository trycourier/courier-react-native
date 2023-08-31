import React from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button } from 'react-native';
import { useCourierInbox } from '@trycourier/courier-react-native';
import InboxCustom from './pages/InboxCustom';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';
import Auth from './pages/Auth';
import Send from './pages/Send';

const Tab = createBottomTabNavigator();

const Navigation = () => {

  const inbox = useCourierInbox({ paginationLimit: 100 });

  const inboxOptions = (): BottomTabNavigationOptions => {

    const badgeCount = () => {

      if (inbox.error) {
        return undefined
      }

      return inbox.unreadMessageCount > 0 ? inbox.unreadMessageCount : undefined

    }

    return {
      headerRight: () => (
        <Button
          onPress={() => inbox.readAllMessages()}
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
      <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} options={inboxOptions()} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={inboxOptions()} />
      <Tab.Screen name="Custom Inbox" component={InboxCustom} options={inboxOptions()} />
      <Tab.Screen name="Send" component={Send} options={icon('send-circle')} />
    </Tab.Navigator>
  );
};

export default Navigation;
