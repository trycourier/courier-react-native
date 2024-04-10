import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import InboxDefault from './inbox/InboxDefault';
import InboxStyled from './inbox/InboxStyled';
import InboxCustom from './inbox/InboxCustom';

const Tab = createMaterialTopTabNavigator();

const Inbox = () => {
  
  return (
    <Tab.Navigator>
      <Tab.Screen name="Default" component={InboxDefault} />
      <Tab.Screen name="Styled" component={InboxStyled} />
      <Tab.Screen name="Custom" component={InboxCustom} />
    </Tab.Navigator>
  );

};

export default Inbox;