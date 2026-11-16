import 'react-native-gesture-handler';
import React from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Home from './Home';
import { Poke } from './Poke';

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Poke initialEnabled={false}>
          <NavigationContainer
            theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <Home />
            <Toast />
          </NavigationContainer>
        </Poke>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
