import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
  DeviceEventEmitter,
} from 'react-native';

// Imports
import { CourierInboxListener } from './models/CourierInboxListener';
import { CourierPushListener } from './models/CourierPushListener';
import { CourierAuthenticationListener } from './models/CourierAuthenticationListener';
import { InboxMessage } from './models/InboxMessage';
import { CourierUserPreferences } from './models/CourierUserPreferences';
import { CourierUserPreferencesTopic } from './models/CourierUserPreferencesTopic';
import { CourierUserPreferencesChannel } from './models/CourierUserPreferencesChannel';
import { CourierUserPreferencesStatus } from './models/CourierUserPreferencesStatus';
import { CourierPushProvider } from './models/CourierPushProvider';

// Exports
export { CourierInboxView } from './views/CourierInboxView';
export { CourierInboxListener } from './models/CourierInboxListener';
export { CourierPushListener } from './models/CourierPushListener';
export { CourierAuthenticationListener } from './models/CourierAuthenticationListener';
export { CourierUserPreferencesChannel } from './models/CourierUserPreferencesChannel';
export { CourierUserPreferencesStatus } from './models/CourierUserPreferencesStatus';
export { CourierPushProvider } from './models/CourierPushProvider';
export { CourierInboxFont, CourierInboxButtonStyle, CourierInboxButton, CourierInboxTextStyle, CourierInboxInfoViewStyle, CourierInboxUnreadIndicatorStyle, CourierInboxTheme } from './models/CourierInboxTheme';
export type iOSForegroundPresentationOptions = 'sound' | 'badge' | 'list' | 'banner';

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
  private inboxListeners: Map<string, CourierInboxListener> = new Map<string, CourierInboxListener>();

  public constructor() {

    // Sets the initial SDK values
    // Defaults to React Native level debugging
    // and will show all foreground notification styles in iOS
    this.setDefaults();

    // Register for inbox listener changes
    this.registerInboxListenerEvents();

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

  /**
   * Returns the status of debugging
   */
  get isDebugging(): boolean {
    return this._isDebugging;
  }

  /**
   * Register inbox listener events
   */
  private registerInboxListenerEvents() {

    CourierEventEmitter.addListener('inboxInitialLoad', () => {
      this.inboxListeners.forEach((value, _) => {
        value.onInitialLoad?.();
      });
    });

    CourierEventEmitter.addListener('inboxError', event => {
      this.inboxListeners.forEach((value, _) => {
        value.onError?.(event);
      });
    });

    CourierEventEmitter.addListener('inboxMessagesChanged', event => {
      this.inboxListeners.forEach((value, _) => {
        value.onMessagesChanged?.(
          event.messages,
          event.unreadMessageCount,
          event.totalMessageCount,
          event.canPaginate,
        );
      });
    });

  }

  /**
   * Sets the notification presentation options for iOS
   */
  public iOSForegroundPresentationOptions(props: { options: iOSForegroundPresentationOptions[] }): string {

    // Only works on iOS
    if (Platform.OS !== 'ios') return 'unsupported';

    const normalizedParams = Array.from(new Set(props.options));
    return CourierReactNativeModules.iOSForegroundPresentationOptions({
      options: normalizedParams,
    });

  }

  /**
   * Gets a token for key
   */
  public getToken(props: { key: string }): Promise<string | undefined> {
    return CourierReactNativeModules.getToken(props.key);
  }

  public getTokenForProvider(props: { provider: CourierPushProvider }): Promise<string | undefined> {
    return CourierReactNativeModules.getToken(props.provider);
  }

  /**
   * Sets the fcm token to be used by Courier
   */
  public setToken(props: { key: string, token: string }): Promise<void> {
    return CourierReactNativeModules.setToken(props.key, props.token);
  }

  public setTokenForProvider(props: { provider: CourierPushProvider, token: string }): Promise<void> {
    return CourierReactNativeModules.setToken(props.provider, props.token);
  }

  /**
   * Returns the notification permission status
   * Only supported on iOS
   */
  public getNotificationPermissionStatus(): Promise<string> {
    return CourierReactNativeModules.getNotificationPermissionStatus();
  }

  /**
   * Requests notification permissions
   * This will show a dialog asking the user for permission
   * Only supported on iOS
   */
  public requestNotificationPermission(): Promise<string> {
    return CourierReactNativeModules.requestNotificationPermission();
  }

  /**
   * Listens to push notification clicked and delivered messages
   */
  public addPushNotificationListener(props: { onPushNotificationClicked?: (push: any) => void, onPushNotificationDelivered?: (push: any) => void }): CourierPushListener {
    
    const pushListener = new CourierPushListener();

    if (Platform.OS === 'android') {

      if (props.onPushNotificationClicked) {
        pushListener.onNotificationClickedListener = DeviceEventEmitter.addListener(this.PUSH_NOTIFICATION_CLICKED, (event: any) => {
          try {
            props.onPushNotificationClicked!(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        });
      }

      if (props.onPushNotificationDelivered) {
        pushListener.onNotificationDeliveredListener = DeviceEventEmitter.addListener(this.PUSH_NOTIFICATION_DELIVERED, (event: any) => {
          try {
            props.onPushNotificationDelivered!(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        });
      }

    }

    if (Platform.OS === 'ios') {

      if (props.onPushNotificationClicked) {
        pushListener.onNotificationClickedListener = CourierEventEmitter.addListener(this.PUSH_NOTIFICATION_CLICKED, (event: any) => {
          try {
            props.onPushNotificationClicked!(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        });
      }

      if (props.onPushNotificationDelivered) {
        pushListener.onNotificationDeliveredListener = CourierEventEmitter.addListener(this.PUSH_NOTIFICATION_DELIVERED, (event: any) => {
          try {
            props.onPushNotificationDelivered!(JSON.parse(event));
          } catch (error) {
            console.log(error);
          }
        });
      }

    }

    // When listener is registered
    // Attempt to fetch the last message that was clicked
    // This is needed for when the app is killed and the
    // user launched the app by clicking on a notifications
    CourierReactNativeModules.registerPushNotificationClickedOnKilledState();

    return pushListener

  }

  /**
   * Gets the user id that is currently being used
   * This is the user id associated with the http requests the sdk does
   */
  get userId(): string | undefined {
    return CourierReactNativeModules.getUserId() ?? undefined
  }

  /**
   * Registers the auth token, client key and user id the sdk should use for requests
   */
  public signIn(props: { accessToken: string, clientKey?: string, userId: string }): Promise<void> {
    return CourierReactNativeModules.signIn(props.accessToken, props.clientKey ?? null, props.userId);
  }

  /**
   * Removes the current user and credentials from the sdk
   */
   public signOut(): Promise<void> {
    return CourierReactNativeModules.signOut();
  }

  /**
   * Listens to authentication changes for the current user
   */
   public addAuthenticationListener(props: { onUserChanged: (userId?: string) => void }): CourierAuthenticationListener {

    const authListener = new CourierAuthenticationListener();

    authListener.onUserChanged = CourierEventEmitter.addListener('courierAuthUserChanged', event => {
      props.onUserChanged(event)
    });

    authListener.listenerId = CourierReactNativeModules.addAuthenticationListener();

    return authListener;

  }

  /**
   * Removes an authentication listener
   */
  public removeAuthenticationListener(props: { listenerId: string }): string {
    return CourierReactNativeModules.removeAuthenticationListener(props.listenerId);
  }

  /**
   * Reads an inbox message
   */
  public readMessage(props: { messageId: string }): string {
    return CourierReactNativeModules.readMessage(props.messageId);
  }

  /**
   * Unreads an inbox message
   */
  public unreadMessage(props: { messageId: string }): string {
    return CourierReactNativeModules.unreadMessage(props.messageId);
  }

  /**
   * Reads all the inbox messages
   */
  public readAllInboxMessages(): Promise<void> {
    return CourierReactNativeModules.readAllInboxMessages();
  }

  /**
   * Listens to changes for the inbox itself
   */
  public addInboxListener(props: { onInitialLoad?: () => void, onError?: (error: string) => void, onMessagesChanged?: (messages: InboxMessage[], unreadMessageCount: number, totalMessageCount: number, canPaginate: boolean) => void }): CourierInboxListener {

    // Set the listener id
    const id = CourierReactNativeModules.addInboxListener();

    // Create the initial listeners
    const listener = new CourierInboxListener(id);
    listener.onInitialLoad = props.onInitialLoad;
    listener.onError = props.onError;
    listener.onMessagesChanged = props.onMessagesChanged;

    // Add listener to manager
    this.inboxListeners.set(id, listener);

    return listener;

  }

  /**
   * Removes an inbox listener
   */
  public removeInboxListener(props: { listenerId: string }): string {

    // Call native code
    CourierReactNativeModules.removeInboxListener(props.listenerId);

    // Remove the js listener
    if (this.inboxListeners.has(props.listenerId)) {
      this.inboxListeners.delete(props.listenerId);
    }

    return props.listenerId;

  }

  /**
   * Refreshes the inbox
   * Useful for pull to refresh
   */
  public async refreshInbox(): Promise<void> {
    return CourierReactNativeModules.refreshInbox();
  }

  /**
   * Fetches the next page of inbox messages
   * Returns the fetched inbox messages
   */
   public async fetchNextPageOfMessages(): Promise<InboxMessage[]> {
    return CourierReactNativeModules.fetchNextPageOfMessages();
  }

  /**
   * Sets the pagination limit
   * Min = 1
   * Max = 100
   */
   public setInboxPaginationLimit(props: { limit: number }): void {
    CourierReactNativeModules.setInboxPaginationLimit(props.limit);
  }
  
  /**
   * Get all available preferences
   */
  public async getUserPreferences(props?: { paginationCursor: string }): Promise<CourierUserPreferences> {
    return CourierReactNativeModules.getUserPreferences(props?.paginationCursor ?? "");
  }

  /**
   * Get individual preferences topic
   */
  public async getUserPreferencesTopic(props: { topicId: string }): Promise<CourierUserPreferencesTopic> {
    return CourierReactNativeModules.getUserPreferencesTopic(props.topicId);
  }

  /**
   * Update individual preferences topic
   */
  public async putUserPreferencesTopic(props: { topicId: string, status: CourierUserPreferencesStatus, hasCustomRouting: boolean, customRouting: CourierUserPreferencesChannel[] }): Promise<void> {
    return CourierReactNativeModules.putUserPreferencesTopic(props.topicId, props.status, props.hasCustomRouting, props.customRouting);
  }
  
}

export default Courier;