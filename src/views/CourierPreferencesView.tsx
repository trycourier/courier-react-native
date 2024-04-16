import React from "react";
import { Platform, requireNativeComponent, UIManager, ViewStyle } from "react-native";
import { CourierPreferencesMode, CourierPreferencesTheme } from "src/models/CourierPreferencesTheme";

type CourierPreferencesProps = {
  mode?: CourierPreferencesMode,
  theme?: { 
    light?: CourierPreferencesTheme, 
    dark?: CourierPreferencesTheme 
  };
  onPreferenceError?: (message: string) => void;
  style?: ViewStyle;
};

const ComponentName = 'CourierPreferencesView';

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const CourierPreferences =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<CourierPreferencesProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export const CourierPreferencesView = (props: CourierPreferencesProps) => {

  const onPreferenceError = (event: any) => {

    // Parse the native event data
    if (props.onPreferenceError) {

      const message = event["error"];
      props.onPreferenceError(message);

    }

  }

  return (
    <CourierPreferences 
      mode={props.mode}
      theme={props.theme ?? { light: undefined, dark: undefined }}
      onPreferenceError={(event: any) => onPreferenceError(event.nativeEvent)}
      style={props.style}
    />
  )

}