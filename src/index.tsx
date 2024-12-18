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
import { CourierClient } from './client/CourierClient';
import { Events, Utils } from './utils';
import { InboxMessageFeed } from './models/InboxMessageFeed';
import { InboxMessageSet } from './models/InboxMessageSet';

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
export { InboxMessageSet } from './models/InboxMessageSet';
export { InboxMessage } from './models/InboxMessage';
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

  private async attachPushNotificationListeners() {

    // Remove existing listeners
    // Only allows one subscription to be active
    this.pushNotificationClickedEmitter?.remove();
    this.pushNotificationDeliveredEmitter?.remove();

    // When a push notification is clicked
    this.pushNotificationClickedEmitter = await this.systemBroadcaster.addListener(Events.Push.CLICKED, (event) => {
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
    this.pushNotificationDeliveredEmitter = await this.systemBroadcaster.addListener(Events.Push.DELIVERED, (event) => {
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

  /**
   * Sets the iOS foreground presentation options for push notifications.
   * This method only works on iOS devices.
   * @param props An object containing an array of iOSForegroundPresentationOptions.
   * @returns A string indicating the result of the operation. Returns 'unsupported' on non-iOS platforms.
   */
  public static setIOSForegroundPresentationOptions(props: { options: iOSForegroundPresentationOptions[] }): string {

    // Only works on iOS
    if (Platform.OS !== 'ios') return 'unsupported';

    const normalizedParams = Array.from(new Set(props.options));
    return Modules.System.setIOSForegroundPresentationOptions({
      options: normalizedParams,
    });

  }

  /**
   * Retrieves the current notification permission status.
   * @returns A Promise that resolves to a string representing the current notification permission status.
   */
  public static async getNotificationPermissionStatus(): Promise<string> {
    return await Modules.System.getNotificationPermissionStatus();
  }

  /**
   * Requests permission to send push notifications to the user.
   * @returns A Promise that resolves to a string indicating the result of the permission request.
   */
  public static async requestNotificationPermission(): Promise<string> {
    return await Modules.System.requestNotificationPermission();
  }

  /**
   * Opens the settings page for the current app.
   * This can be used to direct users to enable notifications if they've previously denied permission.
   */
  public static openSettingsForApp() {
    Modules.System.openSettingsForApp();
  }

  // Client

  /**
   * Gets the current CourierClient instance.
   * @returns {Promise<CourierClient | undefined>} The current CourierClient instance, or undefined if not initialized.
   */
  public async getClient(): Promise<CourierClient | undefined> {

    const client = await Modules.Shared.getClient() ?? undefined;

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

  /**
   * Gets the current user ID.
   * @returns {Promise<string | undefined>} The current user ID, or undefined if not set.
   */
  public async getUserId(): Promise<string | undefined> {
    return await Modules.Shared.getUserId() ?? undefined;
  }

  /**
   * Gets the current tenant ID.
   * @returns {Promise<string | undefined>} The current tenant ID, or undefined if not set.
   */
  public async getTenantId(): Promise<string | undefined> {
    return await Modules.Shared.getTenantId() ?? undefined;
  }

  /**
   * Checks if a user is currently signed in.
   * @returns {Promise<boolean>} True if a user is signed in, false otherwise.
   */
  public async isUserSignedIn(): Promise<boolean> {
    const isSignedIn: string = await Modules.Shared.getIsUserSignedIn() ?? 'false';
    return isSignedIn.toLowerCase() === 'true';
  }

  /**
   * Signs out the current user.
   * @returns {Promise<void>} A promise that resolves when the sign out process is complete.
   */
  public async signOut(): Promise<void> {
    return await Modules.Shared.signOut();
  }

  /**
   * Signs in a user with the provided credentials.
   * @param {Object} props - The sign-in properties.
   * @param {string} props.accessToken - The access token for authentication.
   * @param {string} [props.clientKey] - The client key (optional).
   * @param {string} props.userId - The user ID.
   * @param {string} [props.tenantId] - The tenant ID (optional).
   * @param {boolean} [props.showLogs] - Whether to show debug logs (defaults to __DEV__).
   * @returns {Promise<void>} A promise that resolves when the sign-in process is complete.
   */
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

  /**
   * Adds an authentication listener to monitor user changes.
   * @param {Object} props - The listener properties.
   * @param {function} props.onUserChanged - Callback function triggered when the user changes.
   * @returns {CourierAuthenticationListener} The created authentication listener.
   */
  public async addAuthenticationListener(props: { onUserChanged: (userId?: string) => void }): Promise<CourierAuthenticationListener> {

    // Create a listener
    const listenerId = `authentication_${Utils.generateUUID()}`;

    // Attach the listener
    const listener = new CourierAuthenticationListener(listenerId);
    listener.onUserChanged = await this.sharedBroadcaster.addListener(listenerId, (event) => props.onUserChanged(event));
    const id = await Modules.Shared.addAuthenticationListener(listenerId);
    this.authenticationListeners.set(id, listener);

    return listener;

  }

  /**
   * Removes a specific authentication listener.
   * @param {Object} props - The removal properties.
   * @param {string} props.listenerId - The ID of the listener to remove.
   * @returns {Promise<string>} A promise that resolves to the ID of the removed listener.
   */
  public async removeAuthenticationListener(props: { listenerId: string }): Promise<string> {

    // Remove the native listener
    await Modules.Shared.removeAuthenticationListener(props.listenerId);

    // Remove the listener
    if (this.authenticationListeners.has(props.listenerId)) {
      const listener = this.authenticationListeners.get(props.listenerId);
      listener?.onUserChanged?.remove();
      this.authenticationListeners.delete(props.listenerId);
    }

    return props.listenerId;

  }

  /**
   * Removes all authentication listeners.
   * This method clears all registered authentication listeners, both native and JavaScript.
   */
  public async removeAllAuthenticationListeners() {

    // Remove all native listeners
    await Modules.Shared.removeAllAuthenticationListeners();

    // Iterate through all authentication listeners
    this.authenticationListeners.forEach((listener) => {
      listener.onUserChanged?.remove();
    });

    // Clear the map of authentication listeners
    this.authenticationListeners.clear();

  }

  // Push

  /**
   * Retrieves all push notification tokens.
   * @returns {Promise<Map<string, string>>} A promise that resolves to a Map of provider keys to tokens.
   */
  public async getAllTokens(): Promise<Map<string, string>> {
    const tokensObject = await Modules.Shared.getAllTokens();
    const tokensMap = new Map<string, string>();
    for (const [key, value] of Object.entries(tokensObject)) {
      tokensMap.set(key, value as string);
    }
    return tokensMap;
  }

  /**
   * Retrieves the push notification token for a specific key.
   * @param {Object} props - The properties object.
   * @param {string} props.key - The key associated with the token.
   * @returns {Promise<string | undefined>} A promise that resolves to the token or undefined if not found.
   */
  public async getToken(props: { key: string }): Promise<string | undefined> {
    return await Modules.Shared.getToken(props.key);
  }

  /**
   * Retrieves the push notification token for a specific provider.
   * @param {Object} props - The properties object.
   * @param {CourierPushProvider} props.provider - The push notification provider.
   * @returns {Promise<string | undefined>} A promise that resolves to the token or undefined if not found.
   */
  public async getTokenForProvider(props: { provider: CourierPushProvider }): Promise<string | undefined> {
    return await Modules.Shared.getToken(props.provider);
  }

  /**
   * Sets the push notification token for a specific key.
   * @param {Object} props - The properties object.
   * @param {string} props.key - The key to associate with the token.
   * @param {string} props.token - The push notification token.
   * @returns {Promise<void>} A promise that resolves when the token is set.
   */
  public async setToken(props: { key: string, token: string }): Promise<void> {
    return await Modules.Shared.setToken(props.key, props.token);
  }

  /**
   * Sets the push notification token for a specific provider.
   * @param {Object} props - The properties object.
   * @param {CourierPushProvider} props.provider - The push notification provider.
   * @param {string} props.token - The push notification token.
   * @returns {Promise<void>} A promise that resolves when the token is set.
   */
  public async setTokenForProvider(props: { provider: CourierPushProvider, token: string }): Promise<void> {
    return await Modules.Shared.setToken(props.provider, props.token);
  }

  /**
   * Adds a push notification listener.
   * @param {Object} props - The properties object.
   * @param {function} [props.onPushNotificationClicked] - Callback function triggered when a push notification is clicked.
   * @param {function} [props.onPushNotificationDelivered] - Callback function triggered when a push notification is delivered.
   * @returns {CourierPushListener} The created push notification listener.
   */
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

  /**
   * Removes a specific push notification listener.
   * @param {Object} props - The properties object.
   * @param {string} props.listenerId - The ID of the listener to remove.
   * @returns {string} The ID of the removed listener.
   */
  public async removePushNotificationListener(props: { listenerId: string }): Promise<string> {
    if (this.pushListeners.has(props.listenerId)) {
      this.pushListeners.delete(props.listenerId);
    }
    return props.listenerId;
  }

  /**
   * Removes all push notification listeners.
   */
  public async removeAllPushNotificationListeners() {
    this.pushListeners.forEach((listener) => {
      listener.remove();
    });
    this.pushListeners.clear();
  }

  // Inbox

  /**
   * Gets the current pagination limit for inbox messages.
   * @returns {Promise<number>} A promise that resolves with the current pagination limit.
   */
  public async getInboxPaginationLimit(): Promise<number> {
    return await Modules.Shared.getInboxPaginationLimit();
  }

  /**
   * Sets the pagination limit for inbox messages.
   * @param {number} limit - The new pagination limit to set.
   * @returns {Promise<void>} A promise that resolves when the limit is set.
   */
  public async setInboxPaginationLimit(limit: number): Promise<void> {
    await Modules.Shared.setInboxPaginationLimit(limit);
  }

  /**
   * Opens a specific message in the inbox.
   * @param {Object} props - The properties object.
   * @param {string} props.messageId - The ID of the message to open.
   * @returns {Promise<void>} A promise that resolves when the message is opened.
   */
  public async openMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.openMessage(props.messageId);
  }

  /**
   * Registers a click event for a specific message in the inbox.
   * @param {Object} props - The properties object.
   * @param {string} props.messageId - The ID of the message that was clicked.
   * @returns {Promise<void>} A promise that resolves when the click is registered.
   */
  public async clickMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.clickMessage(props.messageId);
  }

  /**
   * Marks a specific message as read in the inbox.
   * @param {Object} props - The properties object.
   * @param {string} props.messageId - The ID of the message to mark as read.
   * @returns {Promise<void>} A promise that resolves when the message is marked as read.
   */
  public async readMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.readMessage(props.messageId);
  }

  /**
   * Marks a specific message as unread in the inbox.
   * @param {Object} props - The properties object.
   * @param {string} props.messageId - The ID of the message to mark as unread.
   * @returns {Promise<void>} A promise that resolves when the message is marked as unread.
   */
  public async unreadMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.unreadMessage(props.messageId);
  }

  /**
   * Archives a specific message in the inbox.
   * @param {Object} props - The properties object.
   * @param {string} props.messageId - The ID of the message to archive.
   * @returns {Promise<void>} A promise that resolves when the message is archived.
   */
  public async archiveMessage(props: { messageId: string }): Promise<void> {
    return await Modules.Shared.archiveMessage(props.messageId);
  }

  /**
   * Marks all messages in the inbox as read.
   * @returns {Promise<void>} A promise that resolves when all messages are marked as read.
   */
  public async readAllInboxMessages(): Promise<void> {
    return await Modules.Shared.readAllInboxMessages();
  }

  /**
   * Adds a listener for inbox changes.
   * @param {Object} props - The properties object.
   * @param {Function} [props.onInitialLoad] - Callback function called when the inbox is initially loaded.
   * @param {Function} [props.onError] - Callback function called when an error occurs. Receives the error message as a parameter.
   * @param {Function} [props.onUnreadCountChanged] - Callback function called when the unread count changes.
   * @param {Function} [props.onFeedChanged] - Callback function called when the feed changes.
   * @param {Function} [props.onArchiveChanged] - Callback function called when the archive changes.
   * @param {Function} [props.onPageAdded] - Callback function called when a new page is added.
   * @param {Function} [props.onMessageChanged] - Callback function called when a message changes.
   * @param {Function} [props.onMessageAdded] - Callback function called when a new message is added.
   * @param {Function} [props.onMessageRemoved] - Callback function called when a message is removed.
   * @returns {CourierInboxListener} A listener object that can be used to remove the listener later.
   */
  public async addInboxListener(props: {
    onInitialLoad?: () => void,
    onError?: (error: string) => void,
    onUnreadCountChanged?: (unreadCount: number) => void,
    onFeedChanged?: (messageSet: InboxMessageSet) => void,
    onArchiveChanged?: (messageSet: InboxMessageSet) => void,
    onPageAdded?: (feed: InboxMessageFeed, messageSet: InboxMessageSet) => void,
    onMessageChanged?: (feed: InboxMessageFeed, index: number, message: InboxMessage) => void,
    onMessageAdded?: (feed: InboxMessageFeed, index: number, message: InboxMessage) => void,
    onMessageRemoved?: (feed: InboxMessageFeed, index: number, message: InboxMessage) => void
  }): Promise<CourierInboxListener> {

    const listenerId = `inbox_${Utils.generateUUID()}`;

    const listenerIds = {
      loading: `inbox_loading_${Utils.generateUUID()}`,
      error: `inbox_error_${Utils.generateUUID()}`,
      unreadCount: `inbox_unread_count_${Utils.generateUUID()}`,
      feed: `inbox_feed_${Utils.generateUUID()}`,
      archive: `inbox_archive_${Utils.generateUUID()}`,
      pageAdded: `inbox_page_added_${Utils.generateUUID()}`,
      messageChanged: `inbox_message_changed_${Utils.generateUUID()}`,
      messageAdded: `inbox_message_added_${Utils.generateUUID()}`,
      messageRemoved: `inbox_message_removed_${Utils.generateUUID()}`
    };

    // Create the initial listeners
    const listener = new CourierInboxListener(listenerId);

    listener.onInitialLoad = await this.sharedBroadcaster.addListener(listenerIds.loading, (_: any) => {
      props.onInitialLoad?.();
    });

    listener.onError = await this.sharedBroadcaster.addListener(listenerIds.error, (event: any) => {
      props.onError?.(event);
    });

    listener.onUnreadCountChanged = await this.sharedBroadcaster.addListener(listenerIds.unreadCount, (event: any) => {
      props.onUnreadCountChanged?.(event);
    });

    listener.onFeedChanged = await this.sharedBroadcaster.addListener(listenerIds.feed, (event: any) => {
      const convertedMessages = this.convertMessages(event.messages);
      const messageSet: InboxMessageSet = {
        messages: convertedMessages,
        totalMessageCount: event.totalMessageCount,
        canPaginate: event.canPaginate
      }
      props.onFeedChanged?.(messageSet);
    });

    listener.onArchiveChanged = await this.sharedBroadcaster.addListener(listenerIds.archive, (event: any) => {
      const convertedMessages = this.convertMessages(event.messages);
      const messageSet: InboxMessageSet = {
        messages: convertedMessages,
        totalMessageCount: event.totalMessageCount,
        canPaginate: event.canPaginate
      }
      props.onArchiveChanged?.(messageSet);
    });

    listener.onPageAdded = await this.sharedBroadcaster.addListener(listenerIds.pageAdded, (event: any) => {
      const convertedMessages = this.convertMessages(event.messages);
      const messageSet: InboxMessageSet = {
        messages: convertedMessages,
        totalMessageCount: event.totalMessageCount,
        canPaginate: event.canPaginate
      }
      props.onPageAdded?.(event.feed === 'archived' ? 'archived' : 'feed', messageSet);
    });

    listener.onMessageChanged = await this.sharedBroadcaster.addListener(listenerIds.messageChanged, (event: any) => {
      const convertedMessage = this.convertMessage(event.message);
      props.onMessageChanged?.(event.feed === 'archived' ? 'archived' : 'feed', event.index, convertedMessage);
    });

    listener.onMessageAdded = await this.sharedBroadcaster.addListener(listenerIds.messageAdded, (event: any) => {
      const convertedMessage = this.convertMessage(event.message);
      props.onMessageAdded?.(event.feed === 'archived' ? 'archived' : 'feed', event.index, convertedMessage);
    });

    listener.onMessageRemoved = await this.sharedBroadcaster.addListener(listenerIds.messageRemoved, (event: any) => {
      const convertedMessage = this.convertMessage(event.message);
      props.onMessageRemoved?.(event.feed === 'archived' ? 'archived' : 'feed', event.index, convertedMessage);
    });

    // Attach listener to native code
    const id = await Modules.Shared.addInboxListener(
      listenerId,
      listenerIds.loading,
      listenerIds.error,
      listenerIds.unreadCount,
      listenerIds.feed,
      listenerIds.archive,
      listenerIds.pageAdded,
      listenerIds.messageChanged,
      listenerIds.messageAdded,
      listenerIds.messageRemoved
    );

    // Add listener to manager
    this.inboxListeners.set(id, listener);

    return listener;
    
  }

  private convertMessages(messages: string[]): InboxMessage[] {
    return messages.map(jsonString => {
      try {
        return JSON.parse(jsonString) as InboxMessage;
      } catch (error) {
        Courier.log(`Error parsing message: ${error}`);
        return null;
      }
    }).filter((message): message is InboxMessage => message !== null);
  }

  private convertMessage(message: string): InboxMessage {
    try {
      return JSON.parse(message) as InboxMessage;
    } catch (error) {
      Courier.log(`Error parsing message: ${error}`);
      throw error;
    }
  }

  /**
   * Removes a specific inbox listener.
   * @param {Object} props - The properties object.
   * @param {string} props.listenerId - The ID of the listener to remove.
   * @returns {string} The ID of the removed listener.
   */
  public async removeInboxListener(props: { listenerId: string }): Promise<string> {

    // Call native code
    await Modules.Shared.removeInboxListener(props.listenerId);

    // Remove the listener
    if (this.inboxListeners.has(props.listenerId)) {

      // Remove emitters
      const listener = this.inboxListeners.get(props.listenerId);
      listener?.onInitialLoad?.remove();
      listener?.onError?.remove();
      listener?.onUnreadCountChanged?.remove();
      listener?.onFeedChanged?.remove();
      listener?.onArchiveChanged?.remove();
      listener?.onPageAdded?.remove();
      listener?.onMessageChanged?.remove();
      listener?.onMessageAdded?.remove();
      listener?.onMessageRemoved?.remove();

      // Remove the listener
      this.inboxListeners.delete(props.listenerId);

    }

    return props.listenerId;

  }

  /**
   * Removes all inbox listeners.
   */
  public async removeAllInboxListeners() {

    // Call native code
    await Modules.Shared.removeAllInboxListeners();

    // Remove all items from inboxListeners
    this.inboxListeners.forEach((listener) => {
      listener?.onInitialLoad?.remove();
      listener?.onError?.remove();
      listener?.onUnreadCountChanged?.remove();
      listener?.onFeedChanged?.remove();
      listener?.onArchiveChanged?.remove();
      listener?.onPageAdded?.remove();
      listener?.onMessageChanged?.remove();
      listener?.onMessageAdded?.remove();
      listener?.onMessageRemoved?.remove();
    });
    
    this.inboxListeners.clear();

  }

  /**
   * Refreshes the inbox.
   * Useful for pull-to-refresh functionality.
   * @returns {Promise<void>} A promise that resolves when the inbox is refreshed.
   */
  public async refreshInbox(): Promise<void> {
    return await Modules.Shared.refreshInbox();
  }

  /**
   * Fetches the next page of inbox messages.
   * @returns {Promise<InboxMessage[]>} A promise that resolves with an array of fetched inbox messages.
   */
  public async fetchNextPageOfMessages(props: { inboxMessageFeed: InboxMessageFeed }): Promise<InboxMessage[]> {
    const messages = await Modules.Shared.fetchNextPageOfMessages(props.inboxMessageFeed);
    return messages.map((message: string) => JSON.parse(message));
  }
  
}

export default Courier;