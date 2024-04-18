import { CourierPreferencesView } from "@trycourier/courier-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

const PreferencesDefault = () => {

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
      <CourierPreferencesView 
        mode={{ type: 'topic' }}
        style={styles.box} />
    </View>
  );

};

export default PreferencesDefault;