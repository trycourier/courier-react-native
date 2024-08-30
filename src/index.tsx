import {
  Platform,
  EmitterSubscription,
} from 'react-native';

// Imports
import { CourierInboxListener } from './models/CourierInboxListener';
import { CourierPushListener } from './models/CourierPushListener';
import { CourierAuthenticationListener } from './models/CourierAuthenticationListener';
import { InboxMessage } from './models/InboxMessage';
import { CourierPushProvider } from './models/CourierPushProvider';
import { Modules } from './Modules';
import Broadcaster from './Broadcaster';
import { Events, Utils } from './Utils';
import { CourierClient } from './client/CourierClient';

export { CourierClient } from './client/CourierClient';
export { BrandClient } from './client/BrandClient';
export { CourierBrandResponse } from './models/CourierBrand';
export { CourierDevice } from './models/CourierDevice';

// Exports
export { CourierInboxView } from './views/CourierInboxView';
export { CourierPreferencesView } from './views/CourierPreferencesView';
export { CourierInboxListener } from './models/CourierInboxListener';
export { CourierPushListener } from './models/CourierPushListener';
export { CourierUserPreferencesTopic } from './models/CourierUserPreferences';
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

  // Broadcasting
  private systemBroadcaster = new Broadcaster(Modules.System);
  private sharedBroadcaster = new Broadcaster(Modules.Shared);
  private pushNotificationClickedEmitter: EmitterSubscription | undefined;
  private pushNotificationDeliveredEmitter: EmitterSubscription | undefined;

  public constructor() {

    // Sets the initial SDK values
    // will show all foreground notification styles in iOS
    Courier.setIOSForegroundPresentationOptions({ 
      options: ['sound', 'badge', 'list', 'banner']
    });

    // Attach the push notification listeners
    this.attachPushNotificationListeners();

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

  // System (Static)

  private attachPushNotificationListeners() {

    // Remove existing listeners
    // Only allows one subscription to be active
    this.pushNotificationClickedEmitter?.remove();
    this.pushNotificationDeliveredEmitter?.remove();

    // When a push notification is clicked
    this.pushNotificationClickedEmitter = this.systemBroadcaster.addListener(Events.Push.CLICKED, (event) => {
      try {
        const message = JSON.parse(event);
        this.pushListeners.forEach(listener => {
          if (listener.onPushNotificationClicked) {
            listener.onPushNotificationClicked(message);
          }
        });
      } catch (error) {
        Courier.log(`Error parsing push notification clicked event: ${error}`);
      }
    });

    // When a push notification is delivered
    this.pushNotificationDeliveredEmitter = this.systemBroadcaster.addListener(Events.Push.DELIVERED, (event) => {
      try {
        const message = JSON.parse(event);
        this.pushListeners.forEach(listener => {
          if (listener.onPushNotificationDelivered) {
            listener.onPushNotificationDelivered(message);
          }
        });
      } catch (error) {
        Courier.log(`Error parsing push notification delivered event: ${error}`);
      }
    });
  }

  // TODO: Describe
  public static setIOSForegroundPresentationOptions(props: { options: iOSForegroundPresentationOptions[] }): string {

    // Only works on iOS
    if (Platform.OS !== 'ios') return 'unsupported';

    const normalizedParams = Array.from(new Set(props.options));
    return Modules.System.setIOSForegroundPresentationOptions({
      options: normalizedParams,
    });

  }

  // TODO: Describe
  public static async getNotificationPermissionStatus(): Promise<string> {
    return await Modules.System.getNotificationPermissionStatus();
  }

  // TODO: Describe
  public static async requestNotificationPermission(): Promise<string> {
    return await Modules.System.requestNotificationPermission();
  }

  // TODO: Describe
  public static openSettingsForApp() {
    Modules.System.openSettingsForApp();
  }

  // Client

  public get client(): CourierClient | undefined {

    const client = Modules.Shared.getClient() ?? undefined;

    if (!client) {
      return undefined;
    }

    const clientObj = JSON.parse(client);

    return new CourierClient({
      userId: clientObj.userId,
      showLogs: clientObj.showLogs,
      jwt: clientObj.jwt,
      clientKey: clientObj.clientKey,
      connectionId: clientObj.connectionId,
      tenantId: clientObj.tenantId,
    });

  }

  // Authentication

  public get userId(): string | undefined {
    return Modules.Shared.getUserId() ?? undefined;
  }

  public get tenantId(): string | undefined {
    return Modules.Shared.getTenantId() ?? undefined;
  }

  public get isUserSignedIn(): boolean {
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
    listener.onUserChanged = this.sharedBroadcaster.addListener(listenerId, (event) => props.onUserChanged(event));
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

  // Removes all authentication listeners
  public removeAllAuthenticationListeners() {

    // Remove all native listeners
    Modules.Shared.removeAllAuthenticationListeners();

    // Iterate through all authentication listeners
    this.authenticationListeners.forEach((listener) => {
      listener.onUserChanged?.remove();
    });

    // Clear the map of authentication listeners
    this.authenticationListeners.clear();

  }

  // Push

  public async getAllTokens(): Promise<Map<string, string>> {
    const tokensObject = await Modules.Shared.getAllTokens();
    const tokensMap = new Map<string, string>();
    for (const [key, value] of Object.entries(tokensObject)) {
      tokensMap.set(key, value as string);
    }
    return tokensMap;
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

  // TODO: Describe
  public addPushNotificationListener(props: { onPushNotificationClicked?: (push: any) => void, onPushNotificationDelivered?: (push: any) => void }): CourierPushListener {
    
    const listenerId = `push_${Utils.generateUUID()}`;

    const pushListener = new CourierPushListener(
      listenerId,
      props.onPushNotificationClicked,
      props.onPushNotificationDelivered
    );

    // Cache the listener
    this.pushListeners.set(listenerId, pushListener);

    // When listener is registered
    // Attempt to fetch the last message that was clicked
    // This is needed for when the app is killed and the
    // user launched the app by clicking on a notifications
    Modules.System.registerPushNotificationClickedOnKilledState();

    return pushListener;

  }

  public removePushNotificationListener(props: { listenerId: string }): string {
    if (this.pushListeners.has(props.listenerId)) {
      this.pushListeners.delete(props.listenerId);
    }
    return props.listenerId;
  }

  public removeAllPushNotificationListeners() {
    this.pushListeners.forEach((listener) => {
      listener.remove();
    });
    this.pushListeners.clear();
  }

  // Inbox

  // TODO: Describe
  public get inboxPaginationLimit(): number {
    return Modules.Shared.getInboxPaginationLimit();
  }

  // TODO: Describe
  public set inboxPaginationLimit(limit: number) {
    Modules.Shared.setInboxPaginationLimit(limit);
  }

  // TODO: Describe
  public async openMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.openMessage(props.messageId);
  }

  // TODO: Describe
  public async clickMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.clickMessage(props.messageId);
  }

  // TODO: Describe
  public async readMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.readMessage(props.messageId);
  }

  // TODO: Describe
  public async unreadMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.unreadMessage(props.messageId);
  }

  // TODO: Describe
  public async archiveMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.archiveMessage(props.messageId);
  }

  // TODO: Describe
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

    listener.onInitialLoad = this.sharedBroadcaster.addListener(listenerIds.loading, (_: any) => {
      props.onInitialLoad?.();
    });

    listener.onError = this.sharedBroadcaster.addListener(listenerIds.error, (event: any) => {
      props.onError?.(event);
    });

    listener.onMessagesChanged = this.sharedBroadcaster.addListener(listenerIds.messages, (event: any) => {

      // Convert JSON strings to InboxMessage objects
      const convertedMessages: InboxMessage[] = event.messages.map((jsonString: string) => {
        try {
          const parsedMessage = JSON.parse(jsonString);
          return parsedMessage as InboxMessage;
        } catch (error) {
          Courier.log(`Error parsing message: ${error}`);
          return null;
        }
      }).filter((message: InboxMessage | null): message is InboxMessage => message !== null);

      props.onMessagesChanged?.(
        convertedMessages,
        event.unreadMessageCount,
        event.totalMessageCount,
        event.canPaginate,
      );
    });

    // Add listener to manager
    this.inboxListeners.set(id, listener);

    return listener;

  }

  // TODO: Describe
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

  // TODO: Describe
  public removeAllInboxListeners() {

    // Call native code
    Modules.Shared.removeAllInboxListeners();

    // Remove all items from inboxListeners
    this.inboxListeners.forEach((listener) => {
      listener?.onInitialLoad?.remove();
      listener?.onError?.remove();
      listener?.onMessagesChanged?.remove();
    });
    this.inboxListeners.clear();

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
    const messages = await Modules.Shared.fetchNextPageOfMessages();
    return messages.map((message: string) => JSON.parse(message));
  }
  
}

export default Courier;