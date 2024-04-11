import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PreferencesCustom from './preferences/PreferencesCustom';
import PreferencesDefault from './preferences/PreferencesDefault';
import PreferencesStyled from './preferences/PreferencesStyled';

const Tab = createMaterialTopTabNavigator();

const Preferences = () => {

  return (
    <Tab.Navigator>
      <Tab.Screen name="Default" component={PreferencesDefault} />
      <Tab.Screen name="Styled" component={PreferencesStyled} />
      <Tab.Screen name="Custom" component={PreferencesCustom} />
    </Tab.Navigator>
  );

};

export default Preferences;