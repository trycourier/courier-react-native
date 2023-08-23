import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InboxDefault from './pages/InboxDefault';
import InboxStyled from './pages/InboxStyled';
import { Button } from 'react-native';
import Courier from 'courier-react-native';

const Tab = createBottomTabNavigator();

const readAllMessageButton = () => {
  return {
    headerRight: () => (
      <Button
        onPress={() => Courier.readAllInboxMessages()}
        title="Read All"
      />
    )
  }
}

const Navigation = () => {
  return (
    <Tab.Navigator>
      {/* <Tab.Screen name="Auth" component={InboxDefault} /> */}
      <Tab.Screen name="Prebuilt Inbox" component={InboxDefault} options={readAllMessageButton} />
      <Tab.Screen name="Styled Inbox" component={InboxStyled} options={readAllMessageButton} />
      {/* <Tab.Screen name="Tab4" component={InboxDefault} /> */}
      {/* <Tab.Screen name="Tab5" component={InboxDefault} /> */}
    </Tab.Navigator>
  );
};

export default Navigation;

function alert(arg0: string): void {
  throw new Error('Function not implemented.');
}
