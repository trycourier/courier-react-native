import React, { useEffect } from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button } from 'react-native';
import { useCourier } from '@trycourier/courier-react-native';
import InboxCustom from './pages/InboxCustom';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';
import Auth from './pages/Auth';
import Send from './pages/Send';

const Tab = createBottomTabNavigator();

const Navigation = () => {

  const courier = useCourier({ 
    inbox: {
      paginationLimit: 100
    }
  });

  useEffect(() => {

    console.log('Notification Permissions');
    console.log(courier.push?.notificationPermissionStatus);

  }, [courier.push?.notificationPermissionStatus])

  useEffect(() => {

    console.log('Push Tokens');
    console.log(courier.push?.tokens);

  }, [courier.push?.tokens])

  useEffect(() => {

    if (courier.push?.delivered) {
      console.log(courier.push?.delivered);
      Alert.alert('📬 Push Notification Delivered', JSON.stringify(courier.push?.delivered));
    }

  }, [courier.push?.delivered]);

  useEffect(() => {

    if (courier.push?.clicked) {
      console.log(courier.push?.clicked);
      Alert.alert('👆 Push Notification Clicked', JSON.stringify(courier.push?.clicked));
    }

  }, [courier.push?.clicked]);

  const inboxOptions = (): BottomTabNavigationOptions => {

    const badgeCount = () => {

      if (!courier.inbox || courier.inbox?.error) {
        return undefined
      }

      return courier.inbox?.unreadMessageCount > 0 ? courier.inbox?.unreadMessageCount : undefined

    }

    return {
      headerRight: () => (
        <Button
          onPress={() => courier.inbox?.readAllMessages()}
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
