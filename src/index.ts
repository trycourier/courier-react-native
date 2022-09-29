/* eslint-disable */
import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
} from 'react-native';
export enum CourierProvider {
  FCM = 'FCM',
  APNS = 'APNS',
}

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const CourierReactNative = NativeModules.CourierReactNative
  ? NativeModules.CourierReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

interface SignInProps {
  userId: String;
  authToken: String;
}
export function signIn({ userId, authToken }: SignInProps): Promise<string> {
  return CourierReactNative.signIn(userId, authToken);
}

export function getFcmToken(): Promise<string | undefined> {
  return CourierReactNative.getFcmToken();
}

export function getUserId(): Promise<string | undefined> {
  return CourierReactNative.getUserId();
}

export function signOut(): Promise<string> {
  return CourierReactNative.signOut();
}

type SendPushProps = {
  authKey: string;
  userId: string;
  title?: string;
  body?: string;
  providers: (CourierProvider.FCM | CourierProvider.APNS)[];
};
export function sendPush({
  authKey,
  userId,
  title = 'This is a title',
  body = 'This is a message',
  providers,
}: SendPushProps): Promise<string> {
  return CourierReactNative.sendPush(authKey, userId, title, body, providers);
}

export function registerPushNotificationListeners<T>({
  onNotificationClicked,
  onNotificationDelivered,
}: {
  onNotificationClicked: (message: T) => void;
  onNotificationDelivered: (message: T) => void;
}) {
  const notificationClickedListener = DeviceEventEmitter.addListener(
    'pushNotificationClicked',
    onNotificationClicked
  );
  const notificationDeliveredListener = DeviceEventEmitter.addListener(
    'pushNotificationDelivered',
    onNotificationDelivered
  );

  return () => {
    notificationClickedListener.remove();
    notificationDeliveredListener.remove();
  };
}

export function debuggerListener() {
  const eventEmitter = new NativeEventEmitter(NativeModules.CourierReactNative);
  const eventListener = eventEmitter.addListener(
    'courierDebugEvent',
    (event) => {
      console.log('\x1b[36m%s\x1b[0m', 'DEBUGGING COURIER', event);
    }
  );
  return eventListener.remove;
}

export async function setDebugMode(isDebugging: boolean) {
  return {
    status: (await CourierReactNative.setDebugMode(
      __DEV__ ? isDebugging : false
    )) as boolean,
  };
}

export function requestNotificationPermission(): Promise<
  'authorized' | 'denied'
> {
  return CourierReactNative.requestNotificationPermission();
}
