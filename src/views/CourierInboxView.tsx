import React from "react";
import { Platform, requireNativeComponent, UIManager, ViewStyle } from "react-native";
import CourierInboxTheme from "src/models/CourierInboxTheme";
import { InboxAction } from "src/models/InboxAction";
import { InboxMessage } from "src/models/InboxMessage";

type CourierInboxViewProps = {
  lightTheme?: CourierInboxTheme;
  darkTheme?: CourierInboxTheme;
  onClickInboxMessageAtIndex?: (message: InboxMessage, index: number) => void;
  onClickInboxActionForMessageAtIndex?: (action: InboxAction, message: InboxMessage, index: number) => void;
  onScrollInbox?: (offsetY: number, offsetX: number) => void;
  style?: ViewStyle;
};

const ComponentName = 'CourierReactNativeView';

const LINKING_ERROR =
  `The package 'courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
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

  const onClickInboxMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onClickInboxMessageAtIndex) {

      const index = event.nativeEvent["index"]
      const message = event.nativeEvent["message"] as InboxMessage

      props.onClickInboxMessageAtIndex(message, index)

    }

  }

  const onClickInboxActionForMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onClickInboxActionForMessageAtIndex) {

      const index = event.nativeEvent["index"]
      const action = event.nativeEvent["action"] as InboxAction
      const message = event.nativeEvent["message"] as InboxMessage

      props.onClickInboxActionForMessageAtIndex(action, message, index)

    }

  }

  const onScrollInbox = (event: any) => {

    // Parse the native event data
    if (props.onScrollInbox) {

      const contentOffset = event.nativeEvent["contentOffset"]
      props.onScrollInbox(contentOffset["y"], contentOffset["x"])

    }

  }

  return (
    <CourierInbox 
      lightTheme={props.lightTheme} 
      darkTheme={props.darkTheme}
      onClickInboxMessageAtIndex={onClickInboxMessageAtIndex}
      onClickInboxActionForMessageAtIndex={onClickInboxActionForMessageAtIndex}
      onScrollInbox={onScrollInbox}
      style={props.style}
    />
  )

}