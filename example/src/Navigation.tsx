import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <Tab.Navigator>
      {/* <Tab.Screen name="Auth" component={InboxDefault} /> */}
      <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} />
      {/* <Tab.Screen name="Tab4" component={InboxDefault} /> */}
      {/* <Tab.Screen name="Tab5" component={InboxDefault} /> */}
    </Tab.Navigator>
  );
};

export default Navigation;