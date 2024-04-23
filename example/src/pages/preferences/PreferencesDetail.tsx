import React, { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const PreferencesDetail = ({ route, navigation }: any) => {

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      marginBottom: 10,
    },
  });

  const { id } = route.params;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: id
    });
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );

};

export default PreferencesDetail;