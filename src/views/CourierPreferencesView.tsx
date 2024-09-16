import React, { useEffect } from "react";
import { DeviceEventEmitter, EmitterSubscription, Platform, ViewStyle } from "react-native";
import { CourierPreferencesMode, CourierPreferencesTheme } from "src/models/CourierPreferencesTheme";
import { Modules } from "../Modules";

type CourierPreferencesProps = {
  mode?: CourierPreferencesMode,
  theme?: { 
    light?: CourierPreferencesTheme, 
    dark?: CourierPreferencesTheme 
  };
  onScrollPreferences?: (offsetY: number, offsetX: number) => void;
  onPreferenceError?: (message: string) => void;
  style?: ViewStyle;
};

const CourierPreferences = Modules.getNativeComponent('CourierPreferencesView');

export const CourierPreferencesView = (props: CourierPreferencesProps) => {

  let onScrollPreferencesListener: EmitterSubscription | undefined = undefined;

  useEffect(() => {

    return () => {
      onScrollPreferencesListener?.remove();
    }

  }, []);

  useEffect(() => {

    onScrollPreferencesListener?.remove();

    if (Platform.OS === 'android' && props.onScrollPreferences) {
      onScrollPreferencesListener = DeviceEventEmitter.addListener('courierScrollPreferences', onScrollPreferences);
    }

  }, [props.onScrollPreferences])

  const onScrollPreferences = (event: any) => {

    // Parse the native event data
    if (props.onScrollPreferences) {

      const contentOffset = event["contentOffset"];
      props.onScrollPreferences(contentOffset["y"], contentOffset["x"]);

    }

  }

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
      onScrollPreferences={(event: any) => onScrollPreferences(event.nativeEvent)}
      onPreferenceError={(event: any) => onPreferenceError(event.nativeEvent)}
      style={props.style}
    />
  )

}