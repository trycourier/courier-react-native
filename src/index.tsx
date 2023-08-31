import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
  DeviceEventEmitter,
} from 'react-native';

import { CourierInboxListener } from './models/CourierInboxListener';
import { InboxMessage } from './models/InboxMessage';
export { CourierInboxView } from './views/CourierInboxView';
export { CourierInboxProvider, useCourierInbox } from './hooks/useCourierInbox';

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const CourierReactNativeModules = NativeModules.CourierReactNativeModule
  ? NativeModules.CourierReactNativeModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const CourierEventEmitter = new NativeEventEmitter(
  NativeModules.CourierReactNativeModule
);

class Courier {

  readonly PUSH_NOTIFICATION_CLICKED = 'pushNotificationClicked';
  readonly PUSH_NOTIFICATION_DELIVERED = 'pushNotificationDelivered';

  private static _sharedInstance: Courier;
  private _isDebugging = false;
  private debugListener: EmitterSubscription | undefined;

  public constructor() {

    // Sets the initial SDK values
    // Defaults to React Native level debugging
    // and will show all foreground notification styles in iOS
    this.setDefaults();
  }

  // Returns the public shared instance
  public static get shared(): Courier {

    if (!this._sharedInstance) {
      this._sharedInstance = new Courier();
    }

    return this._sharedInstance;

  }

  private async setDefaults() {
    this.setIsDebugging(__DEV__);
    this.iOSForegroundPresentationOptions({ options: ['sound', 'badge', 'list', 'banner'] });
  }

  /**
   * Tells native Courier SDKs to show or hide logs.
   * Defaults to the React __DEV__ mode
   * @example Courier.setIsDebugging(true)
   */
  public setIsDebugging(isDebugging: boolean): boolean {

    // Remove the existing listener if needed
    this.debugListener?.remove();

    // Set a new listener
    // listener needs to be registered first to catch the event
    if (isDebugging) {
      this.debugListener = CourierEventEmitter.addListener('courierDebugEvent', event => {
        console.log('\x1b[36m%s\x1b[0m', 'COURIER', event);
      });
    }

    CourierReactNativeModules.setDebugMode(isDebugging);

    this._isDebugging = isDebugging

    return this._isDebugging;

  }

  get isDebugging(): boolean {
    return this._isDebugging;
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public iOSForegroundPresentationOptions(props: { options: ('sound' | 'badge' | 'list' | 'banner')[] }): string {

    // Only works on iOS
    if (Platform.OS !== 'ios') return 'unsupported';

    const normalizedParams = Array.from(new Set(props.options));
    return CourierReactNativeModules.iOSForegroundPresentationOptions({
      options: normalizedParams,
    });

  }

  /**
   * Gets notification permission status at a system level.
   * @example const permissionStatus = await Courier.getNotificationPermissionStatus()
   */
  public getNotificationPermissionStatus(): Promise<string> {
    return CourierReactNativeModules.getNotificationPermissionStatus();
  }

  /**
   * Requests notification permission status at a system level.
   * Returns the string associated with the permission status.
   * Will return the current status and will not present a popup
   * if the user has already been asked for permission.
   * @example const permissionStatus = await Courier.requestNotificationPermission()
   */
  public requestNotificationPermission(): Promise<string> {
    return CourierReactNativeModules.requestNotificationPermission();
  }

  /**
   * @example 
   *```
    const unsubPushListeners = () => {
      return Courier.registerPushNotificationListeners<YOUR_NOTIFICATION_TYPE>({
        onPushNotificationClicked: (push) => {
          ...
        },
        onPushNotificationDelivered: (push) => {
          ...
        },
      })
    }

    // To unsubscribe the listeners
    unsubPushListeners()
  *```
  * @returns  function that can be used to unsubscribe from registered listeners
  */
  public registerPushNotificationListeners(props: { onPushNotificationClicked: (push: any) => void, onPushNotificationDelivered: (push: any) => void }) {
    
    let notificationClickedListener: EmitterSubscription;
    let notificationDeliveredListener: EmitterSubscription;

    // Android
    if (Platform.OS === 'android') {
      notificationClickedListener = DeviceEventEmitter.addListener(
        this.PUSH_NOTIFICATION_CLICKED,
        (event: any) => {
          try {
            props.onPushNotificationClicked(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        }
      );

      notificationDeliveredListener = DeviceEventEmitter.addListener(
        this.PUSH_NOTIFICATION_DELIVERED,
        (event: any) => {
          try {
            props.onPushNotificationDelivered(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        }
      );
    }

    // iOS
    if (Platform.OS === 'ios') {
      notificationClickedListener = CourierEventEmitter.addListener(
        this.PUSH_NOTIFICATION_CLICKED,
        (event: any) => {
          try {
            props.onPushNotificationClicked(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        }
      );

      notificationDeliveredListener = CourierEventEmitter.addListener(
        this.PUSH_NOTIFICATION_DELIVERED,
        (event: any) => {
          try {
            props.onPushNotificationDelivered(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        }
      );
    }

    // When listener is registered
    // Attempt to fetch the last message that was clicked
    // This is needed for when the app is killed and the
    // user launched the app by clicking on a notifications
    CourierReactNativeModules.registerPushNotificationClickedOnKilledState();

    return () => {
      notificationClickedListener.remove();
      notificationDeliveredListener.remove();
    };

  }

  /**
   * Returns the current user id stored in local native storage
   * @example const userId = await Courier.userId
   */
  get userId(): string | undefined {
    return CourierReactNativeModules.getUserId() ?? undefined
  }

  /**
   * Signs user in and persists signin in between sessions
   * using native level storage apis
   * 
   * @example
   * ```
   *await Courier.signIn({
      accessToken: YOUR_COURIER_GENERATED_JWT,
      clientKey: YOUR_CLIENT_KEY,
      userId: YOUR_USER_ID,
    })
   * ```
   * Your access token should be generated using this endpoint
   * that is requested from your backend
   * https://www.courier.com/docs/reference/auth/issue-token/
   */
  public signIn(props: { accessToken: string, clientKey?: string, userId: string }): Promise<void> {
    return CourierReactNativeModules.signIn(props.accessToken, props.clientKey ?? null, props.userId);
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
   public signOut(): Promise<void> {
    return CourierReactNativeModules.signOut();
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public readMessage(props: { messageId: string }): Promise<void> {
    return CourierReactNativeModules.readMessage(props.messageId);
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public unreadMessage(props: { messageId: string }): Promise<void> {
    return CourierReactNativeModules.unreadMessage(props.messageId);
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public readAllInboxMessages(): Promise<void> {
    return CourierReactNativeModules.readAllInboxMessages();
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public addInboxListener(props: { onInitialLoad?: () => void, onError?: (error: string) => void, onMessagesChanged?: (messages: InboxMessage[], unreadMessageCount: number, totalMessageCount: number, canPaginate: boolean) => void }): CourierInboxListener {

    // Create the initial listeners
    const inboxListener = new CourierInboxListener();

    if (props.onInitialLoad) {
      inboxListener.onInitialLoad = CourierEventEmitter.addListener('inboxInitialLoad', () => {
        props.onInitialLoad!()
      });
    }

    if (props.onError) {
      inboxListener.onError = CourierEventEmitter.addListener('inboxError', event => {
        props.onError!(event)
      });
    }

    if (props.onMessagesChanged) {
      inboxListener.onMessagesChanged = CourierEventEmitter.addListener('inboxMessagesChanged', event => {
        props.onMessagesChanged!(
          event.messages,
          event.unreadMessageCount,
          event.totalMessageCount,
          event.canPaginate,
        )
      });
    }

    inboxListener.listenerId = CourierReactNativeModules.addInboxListener();

    return inboxListener;

  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public removeInboxListener(props: { listenerId: string }): string {
    return CourierReactNativeModules.removeInboxListener(props.listenerId);
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
  public async refreshInbox(): Promise<void> {
    return CourierReactNativeModules.refreshInbox();
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
   public async fetchNextPageOfMessages(): Promise<InboxMessage[]> {
    return CourierReactNativeModules.fetchNextPageOfMessages();
  }

  /**
   * TODO
   * @param props 
   * @returns 
   */
   public setInboxPaginationLimit(props: { limit: number }): void {
    CourierReactNativeModules.setInboxPaginationLimit(props.limit);
  }
  
}

export default Courier;