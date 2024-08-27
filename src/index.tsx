import {
  Platform,
  NativeEventEmitter,
} from 'react-native';

// Imports
import { CourierInboxListener } from './models/CourierInboxListener';
import { CourierPushListener } from './models/CourierPushListener';
import { CourierAuthenticationListener } from './models/CourierAuthenticationListener';
import { InboxMessage } from './models/InboxMessage';
import { CourierUserPreferences } from './models/CourierUserPreferences';
import { CourierUserPreferencesTopic } from './models/CourierUserPreferences';
import { CourierUserPreferencesChannel } from './models/CourierUserPreferences';
import { CourierUserPreferencesStatus } from './models/CourierUserPreferences';
import { CourierPushProvider } from './models/CourierPushProvider';
import { Modules } from './Modules';
import Broadcaster from './Broadcaster';
import { Events, Utils } from './Utils';

export { CourierClient } from './client/CourierClient';
export { BrandClient } from './client/BrandClient';
export { CourierBrandResponse } from './models/CourierBrand';
export { CourierDevice } from './models/CourierDevice';

// Exports
export { CourierInboxView } from './views/CourierInboxView';
export { CourierPreferencesView } from './views/CourierPreferencesView';
export { CourierInboxListener } from './models/CourierInboxListener';
export { CourierPushListener } from './models/CourierPushListener';
export { CourierAuthenticationListener } from './models/CourierAuthenticationListener';
export { CourierUserPreferencesChannel } from './models/CourierUserPreferences';
export { CourierUserPreferencesStatus } from './models/CourierUserPreferences';
export { CourierTrackingEvent } from './models/CourierTrackingEvent';
export { CourierPushProvider } from './models/CourierPushProvider';
export { CourierFont } from './models/CourierFont';
export { CourierButton } from './models/CourierButton';
export { CourierInfoViewStyle } from './models/CourierInfoViewStyle';
export { iOS_CourierCell } from './models/iOS_CourierCell';
export { iOS_CourierSheet } from './models/iOS_CourierSheet';
export { CourierInboxButtonStyle, CourierInboxTextStyle, CourierInboxUnreadIndicatorStyle, CourierInboxTheme } from './models/CourierInboxTheme';
export { CourierPreferencesTheme, CourierPreferencesMode, CourierPreferencesChannel } from './models/CourierPreferencesTheme';
export type iOSForegroundPresentationOptions = 'sound' | 'badge' | 'list' | 'banner';

class Courier {

  // Singleton
  private static _sharedInstance: Courier;

  // Listeners
  private authenticationListeners = new Map<string, CourierAuthenticationListener>();
  private inboxListeners = new Map<string, CourierInboxListener>();
  private pushListeners = new Map<string, CourierPushListener>();

  // Broadcasting and emitting
  private eventEmitter = new NativeEventEmitter(Modules.Shared);
  private broadcaster = new Broadcaster(this.eventEmitter);

  public constructor() {

    // Sets the initial SDK values
    // Defaults to React Native level debugging
    // and will show all foreground notification styles in iOS
    // this.setDefaults();

  }

  // Returns the public shared instance
  public static get shared(): Courier {

    if (!this._sharedInstance) {
      this._sharedInstance = new Courier();
    }

    return this._sharedInstance;

  }

  // Debugging

  private isDebugging = __DEV__;

  // Show a log to the console
  static log(message: string): void {
    if (Courier.shared.isDebugging) {
      console.log(message);
    }
  }

  // Authentication

  get userId(): string | undefined {
    return Modules.Shared.getUserId() ?? undefined;
  }

  get tenantId(): string | undefined {
    return Modules.Shared.getTenantId() ?? undefined;
  }

  get isUserSignedIn(): boolean {
    const isSignedIn: string = Modules.Shared.getIsUserSignedIn() ?? 'false';
    return isSignedIn.toLowerCase() === 'true';
  }

  // TODO: Describe
  public async signOut(): Promise<void> {
    return await Modules.Shared.signOut();
  }

  // TODO: Describe
  public async signIn(props: { accessToken: string, clientKey?: string, userId: string, tenantId?: string, showLogs?: boolean }): Promise<void> {
    this.isDebugging = props.showLogs ?? __DEV__;
    return await Modules.Shared.signIn(
      props.accessToken, 
      props.clientKey ?? null,
      props.userId,
      props.tenantId ?? null,
      this.isDebugging
    );
  }

  // TODO: Describe
  public addAuthenticationListener(props: { onUserChanged: (userId?: string) => void }): CourierAuthenticationListener {

    // Create a listener
    const listenerId = `authentication_${Utils.generateUUID()}`;
    const id = Modules.Shared.addAuthenticationListener(listenerId);

    // Attach the listener
    const listener = new CourierAuthenticationListener(id);
    listener.onUserChanged = this.broadcaster.addListener(listenerId, (event) => props.onUserChanged(event));
    this.authenticationListeners.set(id, listener);

    return listener;

  }

  // TODO: Describe
  public removeAuthenticationListener(props: { listenerId: string }): string {

    // Remove the native listener
    Modules.Shared.removeAuthenticationListener(props.listenerId);

    // Remove the listener
    if (this.authenticationListeners.has(props.listenerId)) {
      const listener = this.authenticationListeners.get(props.listenerId);
      listener?.onUserChanged?.remove();
      this.authenticationListeners.delete(props.listenerId);
    }

    return props.listenerId;

  }

  // Push

  public async getAllTokens(): Promise<Map<string, string>> {
    return await Modules.Shared.getAllTokens();
  }

  // TODO: Describe 
  public async getToken(props: { key: string }): Promise<string | undefined> {
    return await Modules.Shared.getToken(props.key);
  }

  public async getTokenForProvider(props: { provider: CourierPushProvider }): Promise<string | undefined> {
    return await Modules.Shared.getToken(props.provider);
  }

  // TODO: Describe
  public async setToken(props: { key: string, token: string }): Promise<void> {
    return await Modules.Shared.setToken(props.key, props.token);
  }

  public async setTokenForProvider(props: { provider: CourierPushProvider, token: string }): Promise<void> {
    return await Modules.Shared.setToken(props.provider, props.token);
  }

  private async setDefaults() {
    // this.setIsDebugging(__DEV__);
    this.iOSForegroundPresentationOptions({ options: ['sound', 'badge', 'list', 'banner'] });
  }

  // /**
  //  * Tells native Courier SDKs to show or hide logs.
  //  * Defaults to the React __DEV__ mode
  //  */
  // public setIsDebugging(isDebugging: boolean): boolean {

  //   // Remove the existing listener if needed
  //   this.debugListener?.remove();

  //   // Set a new listener
  //   // listener needs to be registered first to catch the event
  //   if (isDebugging) {
  //     this.debugListener = CourierEventEmitter.addListener(Events.Log.DEBUG_LOG, event => {
  //       console.log('\x1b[36m%s\x1b[0m', 'COURIER', event);
  //     });
  //   }

  //   // CourierReactNativeModules.setDebugMode(isDebugging);

  //   this._isDebugging = isDebugging

  //   return this._isDebugging;

  // }

  // /**
  //  * Returns the status of debugging
  //  */
  // get isDebugging(): boolean {
  //   return this._isDebugging;
  // }

  /**
   * Sets the notification presentation options for iOS
   */
  public iOSForegroundPresentationOptions(props: { options: iOSForegroundPresentationOptions[] }): string {

    // Only works on iOS
    if (Platform.OS !== 'ios') return 'unsupported';

    const normalizedParams = Array.from(new Set(props.options));
    return Modules.Shared.iOSForegroundPresentationOptions({
      options: normalizedParams,
    });

  }

  /**
   * Returns the notification permission status
   * Only supported on iOS
   */
  public getNotificationPermissionStatus(): Promise<string> {
    return Modules.Shared.getNotificationPermissionStatus();
  }

  /**
   * Requests notification permissions
   * This will show a dialog asking the user for permission
   * Only supported on iOS
   */
  public requestNotificationPermission(): Promise<string> {
    return Modules.Shared.requestNotificationPermission();
  }

  // TODO: Describe
  public addPushNotificationListener(props: { onPushNotificationClicked?: (push: any) => void, onPushNotificationDelivered?: (push: any) => void }): CourierPushListener {
    
    const listenerId = `push_${Utils.generateUUID()}`;
    const pushListener = new CourierPushListener(listenerId);

    if (props.onPushNotificationClicked) {
      pushListener.onNotificationClickedListener = this.broadcaster.addListener(Events.Push.CLICKED, (event) => {
        try {
          props.onPushNotificationClicked!(JSON.parse(event));
        } catch (error) {
          console.log(error);
        }
      });
    }

    if (props.onPushNotificationDelivered) {
      pushListener.onNotificationDeliveredListener = this.broadcaster.addListener(Events.Push.DELIVERED, (event) => {
        try {
          props.onPushNotificationDelivered!(JSON.parse(event));
        } catch (error) {
          console.log(error);
        }
      });
    }

    // Cache the listener
    this.pushListeners.set(listenerId, pushListener);

    // When listener is registered
    // Attempt to fetch the last message that was clicked
    // This is needed for when the app is killed and the
    // user launched the app by clicking on a notifications
    Modules.Shared.registerPushNotificationClickedOnKilledState();

    return pushListener

  }

  public removePushNotificationListener(props: { listenerId: string }): string {
    if (this.pushListeners.has(props.listenerId)) {
      this.pushListeners.delete(props.listenerId);
    }
    return props.listenerId;
  }

  /**
   * Open an inbox message
   */
  public async openMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.openMessage(props.messageId);
  }

  /**
   * Click an inbox message
   */
  public async clickMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.clickMessage(props.messageId);
  }

  /**
   * Reads an inbox message
   */
  public async readMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.readMessage(props.messageId);
  }

  /**
   * Unreads an inbox message
   */
  public async unreadMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.unreadMessage(props.messageId);
  }

  /**
   * Archive an inbox message
   */
  public async archiveMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.archiveMessage(props.messageId);
  }

  /**
   * Reads all the inbox messages
   */
  public async readAllInboxMessages(): Promise<void> {
    return await Modules.Shared.readAllInboxMessages();
  }

  /**
   * Listens to changes for the inbox itself
   */
  public addInboxListener(props: { onInitialLoad?: () => void, onError?: (error: string) => void, onMessagesChanged?: (messages: InboxMessage[], unreadMessageCount: number, totalMessageCount: number, canPaginate: boolean) => void }): CourierInboxListener {

    const listenerIds = {
      loading: `inbox_loading_${Utils.generateUUID()}`,
      error: `inbox_error_${Utils.generateUUID()}`,
      messages: `inbox_messages_${Utils.generateUUID()}`
    }

    // Set the listener id
    const id = Modules.Shared.addInboxListener(
      listenerIds.loading,
      listenerIds.error,
      listenerIds.messages
    );

    // Create the initial listeners
    const listener = new CourierInboxListener(id);

    // listener.onInitialLoad = Utils.addEventListener(listenerIds.loading, CourierEventEmitter, (_: any) => {
    //   props.onInitialLoad?.();
    // });

    // listener.onError = Utils.addEventListener(listenerIds.error, CourierEventEmitter, (event: any) => {
    //   props.onError?.(event);
    // });

    // listener.onMessagesChanged = Utils.addEventListener(listenerIds.messages, CourierEventEmitter, (event: any) => {
    //   props.onMessagesChanged?.(
    //     event.messages,
    //     event.unreadMessageCount,
    //     event.totalMessageCount,
    //     event.canPaginate,
    //   );
    // });

    // Add listener to manager
    this.inboxListeners.set(id, listener);

    return listener;

  }

  /**
   * Removes an inbox listener
   */
  public removeInboxListener(props: { listenerId: string }): string {

    // Call native code
    Modules.Shared.removeInboxListener(props.listenerId);

    // Remove the listener
    if (this.inboxListeners.has(props.listenerId)) {

      // Remove emitters
      const listener = this.inboxListeners.get(props.listenerId);
      listener?.onInitialLoad?.remove();
      listener?.onError?.remove();
      listener?.onMessagesChanged?.remove();

      // Remove the listener
      this.inboxListeners.delete(props.listenerId);

    }

    return props.listenerId;

  }

  /**
   * Refreshes the inbox
   * Useful for pull to refresh
   */
  public async refreshInbox(): Promise<void> {
    return Modules.Shared.refreshInbox();
  }

  /**
   * Fetches the next page of inbox messages
   * Returns the fetched inbox messages
   */
  public async fetchNextPageOfMessages(): Promise<InboxMessage[]> {
    return Modules.Shared.fetchNextPageOfMessages();
  }

  /**
   * Sets the pagination limit
   * Min = 1
   * Max = 100
   */
  public setInboxPaginationLimit(props: { limit: number }): void {
    Modules.Shared.setInboxPaginationLimit(props.limit);
  }
  
  /**
   * Get all available preferences
   */
  public async getUserPreferences(props?: { paginationCursor: string }): Promise<CourierUserPreferences> {
    return Modules.Shared.getUserPreferences(props?.paginationCursor ?? "");
  }

  /**
   * Get individual preferences topic
   */
  public async getUserPreferencesTopic(props: { topicId: string }): Promise<CourierUserPreferencesTopic> {
    return Modules.Shared.getUserPreferencesTopic(props.topicId);
  }

  /**
   * Update individual preferences topic
   */
  public async putUserPreferencesTopic(props: { topicId: string, status: CourierUserPreferencesStatus, hasCustomRouting: boolean, customRouting: CourierUserPreferencesChannel[] }): Promise<void> {
    return Modules.Shared.putUserPreferencesTopic(props.topicId, props.status, props.hasCustomRouting, props.customRouting);
  }
  
}

export default Courier;