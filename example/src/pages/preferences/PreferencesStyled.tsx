import { CourierPreferencesView } from "@trycourier/courier-react-native";
import Env from "../../Env";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CourierPreferencesTheme } from "src/models/CourierPreferencesTheme";
import { Styles } from "../Styles";

const PreferencesStyled = () => {

  function getTheme(isDark: boolean): CourierPreferencesTheme {

    const styles = Styles(isDark)

    return {
      brandId: Env.brandId,
      sectionTitleFont: {
        family: styles.Fonts.heading,
        size: styles.TextSizes.heading,
        color: styles.Colors.heading
      },
      topicTitleFont: {
        family: styles.Fonts.title,
        size: styles.TextSizes.title,
        color: styles.Colors.title
      },
      topicSubtitleFont: {
        family: styles.Fonts.subtitle,
        size: styles.TextSizes.subtitle,
        color: styles.Colors.subtitle
      },
      topicButton: {
        font: {
          family: styles.Fonts.subtitle,
          size: styles.TextSizes.subtitle,
          color: styles.Colors.title
        },
        backgroundColor: styles.Colors.option,
        cornerRadius: styles.Corners.button
      },
      sheetTitleFont: {
        family: styles.Fonts.heading,
        size: styles.TextSizes.heading,
        color: styles.Colors.heading
      },
      infoViewStyle: {
        font: {
          family: styles.Fonts.title,
          size: styles.TextSizes.title,
          color: styles.Colors.title
        },
        button: {
          font: {
            family: styles.Fonts.subtitle,
            size: styles.TextSizes.subtitle,
            color: styles.Colors.action
          },
          backgroundColor: styles.Colors.title,
          cornerRadius: styles.Corners.button
        }
      },
      iOS: {
        topicCellStyles: {
          separatorStyle: 'none'
        },
        sheetSettingStyles: {
          font: {
            family: styles.Fonts.title,
            size: styles.TextSizes.title,
            color: styles.Colors.title
          },
          toggleColor: styles.Colors.action
        },
        sheetCornerRadius: 20,
        sheetCellStyles: {
          separatorStyle: 'none'
        }
      }
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
          light: getTheme(false),
          dark: getTheme(true),
        }}
        style={styles.box}
       />
    </View>
  );

};

export default PreferencesStyled;