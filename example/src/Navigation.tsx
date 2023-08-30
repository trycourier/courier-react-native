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

  const options = (icon: 'bell'): BottomTabNavigationOptions => {
    return {
      headerRight: () => (
        <Button
          onPress={() => inbox.readAllMessages()}
          title="Read All"
        />
      ),
      tabBarBadge: inbox.unreadMessageCount > 0 ? inbox.unreadMessageCount : undefined,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={icon} color={color} size={size} />
      )
    }
  }

  return (
    <Tab.Navigator>
      <Tab.Screen name="Auth" component={Auth} />
      <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} options={options('bell')} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={options('bell')} />
      <Tab.Screen name="Custom Inbox" component={InboxCustom} options={options('bell')} />
      <Tab.Screen name="Tab5" component={Send} />
    </Tab.Navigator>
  );
};

export default Navigation;
