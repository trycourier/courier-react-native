/* eslint-disable */
import {
  NativeModules,
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native'

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n'

const CourierReactNativeModules = NativeModules.CourierReactNative
  ? NativeModules.CourierReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    )

const CourierEventEmitter = new NativeEventEmitter(
  NativeModules.CourierReactNative
)

export enum CourierProvider {
  FCM = 'firebase-fcm',
  APNS = 'apn',
}

class Courier {

  public constructor() {

    // Sets the initial SDK values
    // Defaults to React Native level debugging
    // and will show all foreground notification styles in iOS
    this.setDefaults()

  }

  private async setDefaults() {
    try {
      await Promise.all([
        this.isDebugging(__DEV__),
        this.iOSForegroundPresentationOptions({
          options: ['sound', 'badge', 'list', 'banner']
        })
      ])
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Tells native Courier SDKs to show or hide logs.
   * Defaults to the React __DEV__ mode
   * @example await Courier.isDebugging(true)
  */
  public isDebugging(isDebugging: boolean): Promise<boolean> {
    return CourierReactNativeModules.setDebugMode(isDebugging)
  }

  /**
   * Returns the current user id stored in local native storage
   * @example const userId = await Courier.userId
   */
  get userId(): Promise<string | undefined> {
    return CourierReactNativeModules.getUserId()
  }

  /**
   * Signs user in and persists signin in between sessions
   * using native level storage apis
   * 
   * @example
   * ```
   *await Courier.signIn({
      accessToken: YOUR_COURIER_GENERATED_JWT,
      userId: YOUR_USER_ID,
    })
  * ```
  * Your access token should be generated using this endpoint
  * that is requested from your backend
  * https://www.courier.com/docs/reference/auth/issue-token/
  */
  public signIn({ accessToken, userId } : { accessToken: string, userId: string }): Promise<void> {
    return CourierReactNativeModules.signIn(userId, accessToken)
  }

  /**
   * Logs user out of native level user storage.
   * This will clear the userId, accessToken, and apns / fcm tokens and
   * delete the matching devices apns / fcm tokens for the user in Courier token management
   * @example await Courier.signOut()
   */
  public signOut(): Promise<void> {
    return CourierReactNativeModules.signOut()
  }

  /**
   * Sets the current Apple Push Notification Service (APNS) token
   * using Courier token management apis
   * @example const apnsToken = await Courier.apnsToken
   */
   get apnsToken(): Promise<string | undefined> {
    if (Platform.OS !== 'ios') return Promise.resolve(undefined)
    return CourierReactNativeModules.getApnsToken()
  }

  /**
   * Sets the current Firebase Cloud Messaging (FCM) token
   * using Courier token management apis
   * @example const fcmToken = await Courier.fcmToken
   */
  get fcmToken(): Promise<string | undefined> {
    return CourierReactNativeModules.getFcmToken()
  }

  /**
   * Sets the current Firebase Cloud Messaging (FCM) token
   * using Courier token management apis
   * @example await setFcmToken('asdf...asdf')
   */
  public setFcmToken(token: string): Promise<void> {
    return CourierReactNativeModules.setFcmToken(token)
  }

  /**
   * Hits the Courier /send endpoint and sends a test push notification
   * @example
   * ```
   *const messageId = await sendPush({
      authKey: YOUR_AUTH_KEY_THAT_SHOULD_NOT_STAY_IN_YOUR_PRODUCTION_APP,
      userId: USER_ID,
      title: 'This is a title',
      body: 'This is a body',
      providers: [CourierProvider.APNS, CourierProvider.FCM],
      isProduction: false, // true is production apns, false is sandbox apns
    });
  * ```
  * @returns promise
  */
  public sendPush(
    { authKey, userId, title, body, providers, isProduction }: 
    { authKey: string, userId: string, title?: string, body?: string, providers: CourierProvider[], isProduction: boolean }): Promise<string> {
    return CourierReactNativeModules.sendPush(authKey, userId, title, body, providers, isProduction)
  }

  /**
   * Gets notification permission status at a system level.
   * @example const permissionStatus = await Courier.getNotificationPermissionStatus()
   */
   get notificationPermissionStatus(): Promise<string> {
    return CourierReactNativeModules.getNotificationPermissionStatus()
  }

  /**
   * Requests notification permission status at a system level.
   * Returns the string associated with the permission status.
   * Will return the current status and will not present a popup 
   * if the user has already been asked for permission.
   * @example const permissionStatus = await Courier.requestNotificationPermission()
   */
  public requestNotificationPermission(): Promise<string> {
    return CourierReactNativeModules.requestNotificationPermission()
  }

  /**
   * Sets the push notification presentation style when the app is in the foreground
   * This does not affect how the notification is shown when the app is killed or in the background states
   * 
   * Defaults to sound, badge, list and/or banner.
   * 
   * @example iOSForegroundPresentationOptions({options: ['sound']});
   */
  public iOSForegroundPresentationOptions({ options }: { options: ('sound' | 'badge' | 'list' | 'banner')[]}): Promise<void> {

    // Only works on iOS
    if (Platform.OS !== 'ios') return Promise.resolve()

    const normalizedParams = Array.from(new Set(options))
    return CourierReactNativeModules.iOSForegroundPresentationOptions({
      options: normalizedParams
    })

  }

}

export default new Courier()

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
      'pushNotificationClicked',
      (event: any) => {
        try {
          onNotificationClicked(JSON.parse(event));
        } catch (error) {
          console.log(error)
        }
      }
    );
    notificationDeliveredListener = DeviceEventEmitter.addListener(
      'pushNotificationDelivered',
      (e: any) => {
        try {
          onNotificationDelivered(JSON.parse(e));
        } catch (e) {
          onNotificationDelivered(e);
        }
      }
    );
  }
  if (Platform.OS === 'ios') {
    notificationClickedListener = CourierEventEmitter.addListener(
      'pushNotificationClicked',
      (e: any) => {
        try {
          onNotificationClicked(JSON.parse(e));
        } catch (e) {
          onNotificationClicked(e);
        }
      }
    );
    notificationDeliveredListener = CourierEventEmitter.addListener(
      'pushNotificationDelivered',
      (e: any) => {
        try {
          onNotificationDelivered(JSON.parse(e));
        } catch (e) {
          onNotificationClicked(e);
        }
      }
    );
  }
  CourierReactNativeModules.registerPushNotificationClickedOnKilledState();

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
  const eventListener = CourierEventEmitter.addListener(
    'courierDebugEvent',
    (event) => {
      console.log('\x1b[36m%s\x1b[0m', 'DEBUGGING COURIER', event);
    }
  );
  return eventListener.remove;
}
