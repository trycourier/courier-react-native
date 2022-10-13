/* eslint-disable */
import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';
export enum CourierProvider {
  FCM = 'firebase-fcm',
  APNS = 'apn',
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

const courierEventEmitter = new NativeEventEmitter(
  NativeModules.CourierReactNative
);

type SignInProps = {
  accessToken: String;
  userId: string;
};
export function signIn({ accessToken, userId }: SignInProps): Promise<string> {
  return CourierReactNative.signIn(userId, accessToken);
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
  isProduction: boolean;
};
export function sendPush({
  authKey,
  userId,
  title,
  body,
  providers,
  isProduction,
}: SendPushProps): Promise<string> {
  console.log(`Setup isProduction: ${isProduction}`);
  return CourierReactNative.sendPush(authKey, userId, title, body, providers);
}

export function registerPushNotificationListeners<T>({
  onNotificationClicked,
  onNotificationDelivered,
}: {
  onNotificationClicked: (message: T) => void;
  onNotificationDelivered: (message: T) => void;
}) {
  let notificationClickedListener: EmitterSubscription;
  let notificationDeliveredListener: EmitterSubscription;
  if (Platform.OS === 'android') {
    notificationClickedListener = DeviceEventEmitter.addListener(
      'pushNotificationClicked',
      onNotificationClicked
    );
    notificationDeliveredListener = DeviceEventEmitter.addListener(
      'pushNotificationDelivered',
      onNotificationDelivered
    );
  }
  if (Platform.OS === 'ios') {
    notificationClickedListener = courierEventEmitter.addListener(
      'pushNotificationClicked',
      onNotificationClicked
    );
    notificationDeliveredListener = courierEventEmitter.addListener(
      'pushNotificationDelivered',
      onNotificationDelivered
    );
  }
  CourierReactNative.registerPushNotificationClickedOnKilledState();

  return () => {
    notificationClickedListener.remove();
    notificationDeliveredListener.remove();
  };
}

export function debuggerListener() {
  const eventListener = courierEventEmitter.addListener(
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

export function requestNotificationPermission(): Promise<string> {
  return CourierReactNative.requestNotificationPermission();
}

export function getNotificationPermissionStatus(): Promise<string> {
  return CourierReactNative.getNotificationPermissionStatus();
}

export function iOSForegroundPresentationOptions(params: {
  options: ('sound' | 'badge' | 'list' | 'banner')[];
}) {
  const normalizedParams = new Set(params.options);
  return CourierReactNative.iOSForegroundPresentationOptions({
    options: Array.from(normalizedParams),
  });
}

export function getApnsToken(): Promise<string | undefined> {
  if (Platform.OS === 'android') {
    return Promise.reject(
      'This function is not available for android platform'
    );
  }
  return CourierReactNative.getApnsToken();
}
