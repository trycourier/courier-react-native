import Courier from "@trycourier/courier-react-native";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const Auth = () => {

  useEffect(() => {
    
    console.log('Initial User: ' + Courier.shared.userId);

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