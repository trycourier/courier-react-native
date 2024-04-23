import React, { useEffect, useState } from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Auth from './pages/Auth';
import Push from './pages/Push';
import Inbox from './pages/Inbox';
import Courier from '@trycourier/courier-react-native';
import PreferencesStack from './pages/PreferencesStack';

const Tab = createBottomTabNavigator();

const Home = () => {

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {

    // Debugging

    // Courier.shared.setIsDebugging(false);

    // Setup Push

    Courier.shared.iOSForegroundPresentationOptions({ options: ['sound', 'badge', 'list', 'banner'] });

    const pushListener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked(push) {
        console.log(push);
        Alert.alert('👆 Push Notification Clicked', JSON.stringify(push));
      },
      onPushNotificationDelivered(push) {
        console.log(push);
        Alert.alert('📬 Push Notification Delivered', JSON.stringify(push));
      }
    });

    // Setup Inbox

    Courier.shared.setInboxPaginationLimit({ limit: 100 });

    const inboxListener = Courier.shared.addInboxListener({
      onError(_error) {
        setUnreadCount(0);
      },
      onMessagesChanged(_messages, unreadMessageCount, _totalMessageCount, _canPaginate) {
        setUnreadCount(unreadMessageCount);
      },
    });

    return () => {
      pushListener.remove();
      inboxListener.remove();
    };

  }, []);

  const inboxOptions = (): BottomTabNavigationOptions => {

    const badgeCount = () => {
      return unreadCount > 0 ? unreadCount : undefined;
    }

    return {
      headerRight: () => (
        <Button
          onPress={() => Courier.shared.readAllInboxMessages()}
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
      <Tab.Screen name="Push" component={Push} options={icon('message-badge')} />
      <Tab.Screen name="Inbox" component={Inbox} options={inboxOptions()} />
      <Tab.Screen name="Preferences" component={PreferencesStack} options={{ ...icon('wrench'), headerShown: false }} />
    </Tab.Navigator>
  );
};

export default Home;
