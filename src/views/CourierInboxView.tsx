import React, { useEffect } from "react";
import { Platform, requireNativeComponent, UIManager, ViewStyle, DeviceEventEmitter, EmitterSubscription } from "react-native";
import { InboxAction } from "../models/InboxAction";
import { InboxMessage } from "../models/InboxMessage";
import { CourierInboxTheme } from "src/models/CourierInboxTheme";

type CourierInboxViewProps = {
  theme?: { 
    light?: CourierInboxTheme, 
    dark?: CourierInboxTheme 
  };
  onClickInboxMessageAtIndex?: (message: InboxMessage, index: number) => void;
  onClickInboxActionForMessageAtIndex?: (action: InboxAction, message: InboxMessage, index: number) => void;
  onScrollInbox?: (offsetY: number, offsetX: number) => void;
  style?: ViewStyle;
};

const ComponentName = 'CourierReactNativeView';

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const CourierInbox =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<CourierInboxViewProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

export const CourierInboxView = (props: CourierInboxViewProps) => {

  let onClickInboxMessageAtIndexListener: EmitterSubscription | undefined = undefined;
  let onClickInboxActionForMessageAtIndexListener: EmitterSubscription | undefined = undefined;
  let onScrollInboxListener: EmitterSubscription | undefined = undefined;

  useEffect(() => {

    return () => {
      onClickInboxMessageAtIndexListener?.remove();
      onClickInboxActionForMessageAtIndexListener?.remove();
      onScrollInboxListener?.remove();
    }

  }, []);

  useEffect(() => {

    onClickInboxMessageAtIndexListener?.remove();

    if (Platform.OS === 'android' && props.onClickInboxMessageAtIndex) {
      onClickInboxMessageAtIndexListener = DeviceEventEmitter.addListener('courierClickMessageAtIndex', onClickInboxMessageAtIndex);
    }

  }, [props.onClickInboxMessageAtIndex]);

  const onClickInboxMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onClickInboxMessageAtIndex) {

      const index = event["index"]
      const message = event["message"] as InboxMessage

      props.onClickInboxMessageAtIndex(message, index)

    }

  }

  useEffect(() => {

    onClickInboxActionForMessageAtIndexListener?.remove();

    if (Platform.OS === 'android' && props.onClickInboxActionForMessageAtIndex) {
      onClickInboxActionForMessageAtIndexListener = DeviceEventEmitter.addListener('courierClickActionAtIndex', onClickInboxActionForMessageAtIndex);
    }

  }, [props.onClickInboxActionForMessageAtIndex])

  const onClickInboxActionForMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onClickInboxActionForMessageAtIndex) {

      const index = event["index"]
      const action = event["action"] as InboxAction
      const message = event["message"] as InboxMessage

      props.onClickInboxActionForMessageAtIndex(action, message, index)

    }

  }

  useEffect(() => {

    onScrollInboxListener?.remove();

    if (Platform.OS === 'android' && props.onScrollInbox) {
      onScrollInboxListener = DeviceEventEmitter.addListener('courierScrollInbox', onScrollInbox);
    }

  }, [props.onScrollInbox])

  const onScrollInbox = (event: any) => {

    // Parse the native event data
    if (props.onScrollInbox) {

      const contentOffset = event["contentOffset"]
      props.onScrollInbox(contentOffset["y"], contentOffset["x"])

    }

  }

  return (
    <CourierInbox 
      theme={props.theme ?? { light: undefined, dark: undefined }} 
      onClickInboxMessageAtIndex={(event: any) => onClickInboxMessageAtIndex(event.nativeEvent)}
      onClickInboxActionForMessageAtIndex={(event: any) => onClickInboxActionForMessageAtIndex(event.nativeEvent)}
      onScrollInbox={(event: any) => onScrollInbox(event.nativeEvent)}
      style={props.style}
    />
  )

}