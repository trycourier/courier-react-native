import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Home from './Home';
import { Poke } from './Poke';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Poke initialEnabled={false}>
          <NavigationContainer>
            <Home />
            <Toast />
          </NavigationContainer>
        </Poke>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
