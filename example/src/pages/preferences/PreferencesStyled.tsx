import { CourierPreferencesView } from "@trycourier/courier-react-native";
import Env from "../../Env";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { CourierPreferencesTheme } from "src/models/CourierPreferencesTheme";

const PreferencesStyled = () => {

  const primaryColor = '#882DB9'
  const secondaryColor = '#EA6866'

  const titleFont = Platform.OS === 'ios' ? 'Avenir Black' : 'fonts/poppins_regular.otf'
  const defaultFont = Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'

  const lightTheme: CourierPreferencesTheme = {
    brandId: Env.brandId,
    loadingIndicatorColor: primaryColor,
    sectionTitleFont: {
      family: titleFont,
      size: 24,
      color: primaryColor
    }
  }

  const darkTheme: CourierPreferencesTheme = {
    brandId: Env.brandId,
    loadingIndicatorColor: '#ffffff',
    sectionTitleFont: {
      family: titleFont,
      size: 20,
      color: primaryColor
    }
  }

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
        mode={{ 
          type: 'channels', 
          channels: ['push', 'sms', 'email'] 
        }}
        theme={{
          light: lightTheme,
          dark: darkTheme
        }}
        style={styles.box}
       />
    </View>
  );

};

export default PreferencesStyled;