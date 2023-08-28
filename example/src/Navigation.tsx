import React, { useEffect, useState } from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';
import { Button, Platform } from 'react-native';
import Courier from '@trycourier/courier-react-native';
import InboxCustom from './pages/InboxCustom';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const Navigation = () => {

  const [unreadCount, setUnreadCount] = useState<number | undefined>(undefined)

  useEffect(() => {

    const listener = Courier.addInboxListener({
      onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
        console.log(messages.length, unreadMessageCount, totalMessageCount, canPaginate)
        setUnreadCount(unreadMessageCount > 0 ? unreadMessageCount : undefined)
      }
    })

    return () => {
      listener.remove()
    }

  }, [])

  const options = (icon: 'bell'): BottomTabNavigationOptions => {
    return {
      headerRight: () => (
        <Button
          onPress={() => Courier.readAllInboxMessages()}
          title="Read All"
        />
      ),
      tabBarBadge: unreadCount,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={icon} color={color} size={size} />
      )
    }
  }

  return (
    <Tab.Navigator>
      {/* <Tab.Screen name="Auth" component={InboxDefault} /> */}
      <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} options={options('bell')} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={options('bell')} />
      <Tab.Screen name="Custom Inbox" component={InboxCustom} options={options('bell')} />
      {/* <Tab.Screen name="Tab5" component={InboxDefault} /> */}
    </Tab.Navigator>
  );
};

export default Navigation;
