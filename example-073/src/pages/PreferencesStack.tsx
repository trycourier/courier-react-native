import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Preferences from './Preferences';
import PreferencesDetail from './preferences/PreferencesDetail';

const Stack = createStackNavigator();

const PreferencesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="PreferencesTab" component={Preferences} />
      <Stack.Screen name="PreferencesDetail" component={PreferencesDetail} />
    </Stack.Navigator>
  );
};

export default PreferencesStack;
