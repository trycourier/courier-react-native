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

const PUSH_NOTIFICATION_CLICKED = 'pushNotificationClicked';
const PUSH_NOTIFICATION_DELIVERED = 'pushNotificationDelivered';

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

/**
 * signs user in, persists signin in between sessions
 * @example
 * ```
 *    const res = await signIn({
        accessToken: ACCESS_TOKEN,
        userId: USER_ID,
      });
 * ```
 * @param param0 Object{accessToken, userId}
 * @returns promise
 */
export function signIn({ accessToken, userId }: SignInProps): Promise<string> {
  return CourierReactNative.signIn(userId, accessToken);
}

/**
 * @example
 * ```
 * const fcmToken = await getFcmToken();
 * ```
 * @returns Promise with string or undefined depending on available fcm token
 */
export function getFcmToken(): Promise<string | undefined> {
  return CourierReactNative.getFcmToken();
}

/**
 * @example
 * ```
 * const userId = await getUserId();
 * ```
 * @returns Promise with string or undefined depending on available userId
 */
export function getUserId(): Promise<string | undefined> {
  return CourierReactNative.getUserId();
}

/**
 * loggs user out and remove all stored user credentials
 * @example
 * ```
 *   const res = await signOut();
 * ```
 * @returns Promise
 */
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

/**
 * can be used to test pus notification while development
 * @example
 * ```
 *      const res = await sendPush({
        authKey: ACCESS_TOKEN,
        userId: USER_ID,
        title: 'This is a title',
        body: 'This is a body',
        providers: [
          Platform.OS === 'ios'
            ? CourierProvider.APNS
            : CourierProvider.FCM,
        ],
        isProduction: !__DEV__,
      });
 * ```
 * @returns promise
 */
export function sendPush({
  authKey,
  userId,
  title,
  body,
  providers,
  isProduction,
}: SendPushProps): Promise<string> {
  return CourierReactNative.sendPush(
    authKey,
    userId,
    title,
    body,
    providers,
    isProduction
  );
}

/**
 * @example 
 *```
	const addNotificationListeners = () =>
  registerPushNotificationListeners<NotificationType>({
    onNotificationClicked: (notification) => {
				...
    },
    onNotificationDelivered: (notification) => {
				...
    },
  });
	const unsubscribeAddNotificationListener = addNotificationListeners();
	unsubscribeAddNotificationListener()
 *```
 * @returns  function that can be used to unsubscribe from registered listeners
 */

const tryCatchAndHandleNotification =
  (callback: (message: any) => void) => (event: any) => {
    try {
      const parsedData = JSON.parse(event);
      callback(parsedData);
    } catch (error) {
      console.error(error);
    }
  };

export function registerPushNotificationListeners({
  onNotificationClicked,
  onNotificationDelivered,
}: {
  onNotificationClicked: (message: any) => void;
  onNotificationDelivered: (message: any) => void;
}) {
  let notificationClickedListener: EmitterSubscription;
  let notificationDeliveredListener: EmitterSubscription;
  if (Platform.OS === 'android') {
    notificationClickedListener = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_CLICKED,
      tryCatchAndHandleNotification(onNotificationClicked)
    );
    notificationDeliveredListener = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_DELIVERED,
      tryCatchAndHandleNotification(onNotificationDelivered)
    );
  }
  if (Platform.OS === 'ios') {
    notificationClickedListener = courierEventEmitter.addListener(
      PUSH_NOTIFICATION_CLICKED,
      tryCatchAndHandleNotification(onNotificationClicked)
    );
    notificationDeliveredListener = courierEventEmitter.addListener(
      PUSH_NOTIFICATION_DELIVERED,
      tryCatchAndHandleNotification(onNotificationDelivered)
    );
  }
  CourierReactNative.registerPushNotificationClickedOnKilledState();

  return () => {
    notificationClickedListener.remove();
    notificationDeliveredListener.remove();
  };
}

/**
 * subscribes to native courier logs
 * @example
 * ```
 * const unsubscribeDebugListener = debuggerListener();
 * unsubscribeDebugListener
 * ```
 * @returns function which can be used to unsubscribe from debug log
 *
 */
export function debuggerListener() {
  const eventListener = courierEventEmitter.addListener(
    'courierDebugEvent',
    (event) => {
      console.log('\x1b[36m%s\x1b[0m', 'DEBUGGING COURIER', event);
    }
  );
  return eventListener.remove;
}

/**
 * can be used to listen to native debug logs
 * @example
 * ```
 *setDebugMode(true);
 * ```
 * @returns promise with isDebugging status
 */
export async function setDebugMode(isDebugging: boolean) {
  return {
    status: (await CourierReactNative.setDebugMode(
      __DEV__ ? isDebugging : false
    )) as boolean,
  };
}

/**
 * @example await requestNotificationPermission
 * requests notification permission
 * can be called anywhere in the app
 * @returns promise with notification permission status
 */
export function requestNotificationPermission(): Promise<string> {
  return CourierReactNative.requestNotificationPermission();
}

/**
 * @example const notificationStatus = await getNotificationPermissionStatus()
 * @returns promise with notification status
 */
export function getNotificationPermissionStatus(): Promise<string> {
  return CourierReactNative.getNotificationPermissionStatus();
}

/**
 * @example iOSForegroundPresentationOptions({options: ['sound']})
 * takes an array of strings and sets foreground notification for ios
 * @param {} {options:['sound', 'badge' , 'list' ,'banner']}
 */
export function iOSForegroundPresentationOptions({
  options,
}: {
  options: ('sound' | 'badge' | 'list' | 'banner')[];
}): void {
  if (Platform.OS === 'ios') {
    const normalizedParams = new Set(options);
    CourierReactNative.iOSForegroundPresentationOptions({
      options: Array.from(normalizedParams),
    });
  }
}

/**
 * @example
 * ```
 * const currentApnsToken = await getApnsToken();
 * ```
 * @returns returns promise with string or undefined for ios
 */
export function getApnsToken(): Promise<string | undefined> {
  if (Platform.OS === 'android') {
    return Promise.reject(
      'This function is not available for android platform'
    );
  }
  return CourierReactNative.getApnsToken();
}

/**
 * @example
 * await setFcmToken('token')
 * sets fcm token for both ios and android
 * @returns returns promise with string.
 */
export function setFcmToken(token: string): Promise<string> {
  return CourierReactNative.setFcmToken(token);
}
