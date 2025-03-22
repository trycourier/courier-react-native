import React, { useEffect } from "react";
import { Platform, ViewStyle, DeviceEventEmitter, EmitterSubscription } from "react-native";
import { InboxAction } from "../models/InboxAction";
import { InboxMessage } from "../models/InboxMessage";
import { CourierInboxTheme } from "../models/CourierInboxTheme";
import { Modules } from "../Modules";

type CourierInboxViewProps = {
  canSwipePages?: boolean,
  theme?: { 
    light?: CourierInboxTheme, 
    dark?: CourierInboxTheme 
  };
  onClickInboxMessageAtIndex?: (message: InboxMessage, index: number) => void;
  onLongPressInboxMessageAtIndex?: (message: InboxMessage, index: number) => void;
  onClickInboxActionForMessageAtIndex?: (action: InboxAction, message: InboxMessage, index: number) => void;
  onScrollInbox?: (offsetY: number, offsetX: number) => void;
  style?: ViewStyle;
};

const CourierInbox = Modules.getNativeComponent('CourierInboxView');

export const CourierInboxView = (props: CourierInboxViewProps) => {

  let onClickInboxMessageAtIndexListener: EmitterSubscription | undefined = undefined;
  let onLongPressInboxMessageAtIndexListener: EmitterSubscription | undefined = undefined;
  let onClickInboxActionForMessageAtIndexListener: EmitterSubscription | undefined = undefined;
  let onScrollInboxListener: EmitterSubscription | undefined = undefined;

  useEffect(() => {

    return () => {
      onClickInboxMessageAtIndexListener?.remove();
      onLongPressInboxMessageAtIndexListener?.remove();
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

      const index = event["index"];
      const message = InboxMessage.fromJson(event["message"]);

      props.onClickInboxMessageAtIndex(message, index);

    }

  }

  useEffect(() => {

    onLongPressInboxMessageAtIndexListener?.remove();

    if (Platform.OS === 'android' && props.onLongPressInboxMessageAtIndex) {
      onLongPressInboxMessageAtIndexListener = DeviceEventEmitter.addListener('courierLongPressMessageAtIndex', onLongPressInboxMessageAtIndex);
    }

  }, [props.onLongPressInboxMessageAtIndex]);

  const onLongPressInboxMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onLongPressInboxMessageAtIndex) {

      const index = event["index"];
      const message = InboxMessage.fromJson(event["message"]);

      props.onLongPressInboxMessageAtIndex(message, index);

    }

  }

  useEffect(() => {

    onClickInboxActionForMessageAtIndexListener?.remove();

    if (Platform.OS === 'android' && props.onClickInboxActionForMessageAtIndex) {
      onClickInboxActionForMessageAtIndexListener = DeviceEventEmitter.addListener('courierClickActionAtIndex', onClickInboxActionForMessageAtIndex);
    }

  }, [props.onClickInboxActionForMessageAtIndex]);

  const onClickInboxActionForMessageAtIndex = (event: any) => {

    // Parse the native event data
    if (props.onClickInboxActionForMessageAtIndex) {

      const index = event["index"];
      const action = InboxAction.fromJson(event["action"]);
      const message = InboxMessage.fromJson(event["message"]);

      props.onClickInboxActionForMessageAtIndex(action, message, index);

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

      const contentOffset = event["contentOffset"];
      props.onScrollInbox(contentOffset["y"], contentOffset["x"]);

    }

  }

  return (
    <CourierInbox 
      canSwipePages={props.canSwipePages ?? false}
      theme={props.theme ?? { light: undefined, dark: undefined }} 
      onClickInboxMessageAtIndex={(event: any) => onClickInboxMessageAtIndex(event.nativeEvent)}
      onLongPressInboxMessageAtIndex={(event: any) => onLongPressInboxMessageAtIndex(event.nativeEvent)}
      onClickInboxActionForMessageAtIndex={(event: any) => onClickInboxActionForMessageAtIndex(event.nativeEvent)}
      onScrollInbox={(event: any) => onScrollInbox(event.nativeEvent)}
      style={props.style}
    />
  )

}