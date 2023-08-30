import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const Auth = () => {

  useEffect(() => {
    
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    box: {
      width: '100%',
      height: '100%',
    },
  });
  
  return (
    <View style={styles.container}>
      <Text>Auth</Text>
    </View>
  );

};

export default Auth;