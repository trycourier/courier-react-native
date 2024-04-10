import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PreferencesCustom from './preferences/PreferencesCustom';

const Tab = createMaterialTopTabNavigator();

const Preferences = () => {

  return (
    <Tab.Navigator>
      <Tab.Screen name="Default" component={PreferencesCustom} />
      <Tab.Screen name="Styled" component={PreferencesCustom} />
      <Tab.Screen name="Custom" component={PreferencesCustom} />
    </Tab.Navigator>
  );

};

export default Preferences;