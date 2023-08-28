import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
} from 'react-native';
import { CourierInboxListener } from './models/CourierInboxListener';
import { InboxMessage } from './models/InboxMessage';

export { CourierInboxView } from './views/CourierInboxView';

const LINKING_ERROR =
  `The package 'courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
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

  public constructor() {

    // Sets the initial SDK values
    // Defaults to React Native level debugging
    // and will show all foreground notification styles in iOS
    this.setDefaults();
  }

  private async setDefaults() {
    try {
      await Promise.all([
        this.setIsDebugging(__DEV__),
        // this.iOSForegroundPresentationOptions({
        //   options: ['sound', 'badge', 'list', 'banner'],
        // }),
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  private _isDebugging = false;

  private debugListener: EmitterSubscription | undefined;

  /**
   * Tells native Courier SDKs to show or hide logs.
   * Defaults to the React __DEV__ mode
   * @example Courier.setIsDebugging(true)
   */
  public async setIsDebugging(isDebugging: boolean): Promise<boolean> {

    // Remove the existing listener if needed
    this.debugListener?.remove();

    // Set a new listener
    // listener needs to be registered first to catch the event
    if (isDebugging) {
      this.debugListener = CourierEventEmitter.addListener('courierDebugEvent', event => {
        console.log('\x1b[36m%s\x1b[0m', 'COURIER', event);
      });
    }

    this._isDebugging = await CourierReactNativeModules.setDebugMode(isDebugging);

    return this._isDebugging;

  }

  get isDebugging(): boolean {
    return this._isDebugging;
  }

  /**
   * Returns the current user id stored in local native storage
   * @example const userId = await Courier.userId
   */
  get userId(): Promise<string | undefined> {
    return CourierReactNativeModules.getUserId();
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
  public addInboxListener(props: { onInitialLoad: () => void, onError: () => void, onMessagesChanged: (messages: InboxMessage[]) => void }): CourierInboxListener {

    // Create the initial listeners
    const inboxListener = new CourierInboxListener();

    if (props.onInitialLoad) {
      inboxListener.onInitialLoad = CourierEventEmitter.addListener('inboxInitialLoad', () => {
        props.onInitialLoad!()
      });
    }

    if (props.onError) {
      inboxListener.onError = CourierEventEmitter.addListener('inboxError', event => {
        console.log(event)
        props.onError!()
      });
    }

    if (props.onMessagesChanged) {
      inboxListener.onMessagesChanged = CourierEventEmitter.addListener('inboxMessagesChanged', event => {
        console.log('onMessagesChanged')
        console.log(event)
        props.onMessagesChanged!(
          event.messages
        )
      });
    }

    inboxListener.listenerId = CourierReactNativeModules.addInboxListener(null);

    return inboxListener;

  }

  public removeInboxListener(props: { listenerId: string }): string {
    return CourierReactNativeModules.removeInboxListener(props.listenerId);
  }
  
}

export default new Courier();