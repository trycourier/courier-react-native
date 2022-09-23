import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { multiply, signIn } from '@trycourier/courier-react-native';
import { userId, authToken } from './config/constants';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  React.useEffect(() => {
    multiply(3, 7).then(setResult);
    signIn({ userId, authToken }).then(console.log).catch(console.log);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
