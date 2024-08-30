import Courier, { CourierClient, CourierUserPreferencesStatus, CourierUserPreferencesChannel, CourierTrackingEvent, CourierPushProvider, iOSForegroundPresentationOptions } from "@trycourier/courier-react-native";
import Env from "./Env";
import { ExampleServer, Utils } from "./Utils";

export class OldTests {

  public static client: CourierClient | undefined;

  public static async testClient() {

    const userId = Utils.generateUUID();
    
    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    OldTests.client = new CourierClient({
      userId: userId,
      showLogs: true,
      jwt: token,
      clientKey: Env.clientKey,
      tenantId: undefined,
      connectionId: undefined,
    });

    return OldTests.client?.options;

  }

  public static async testPutToken(token: string = 'example', provider: string = 'expo') {

    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    await OldTests.client.tokens.putUserToken({
      token,
      provider,
    });

  }

  public static async testDeleteToken() {

    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    await OldTests.client.tokens.deleteUserToken({
      token: 'example',
    });
    
  }

  public static async testBrands() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    return await OldTests.client.brands.getBrand({
      brandId: Env.brandId,
    });
  }

  public static async testMessages() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    return await OldTests.client.inbox.getMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
  }

  public static async testUnreadCount() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    return await OldTests.client.inbox.getUnreadMessageCount();
  }

  public static async testArchivedMessages() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    return await OldTests.client.inbox.getArchivedMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
  }

  public static async testMessageById() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    return await OldTests.client.inbox.getMessageById({
      messageId: messageId,
    });
  }

  public static async openMessage() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await OldTests.client.inbox.open({
      messageId: messageId,
    });
  }

  public static async clickMessage() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await OldTests.client.inbox.click({
      messageId: messageId,
      trackingId: 'tracking_example',
    });
  }

  public static async readMessage() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await OldTests.client.inbox.read({
      messageId: messageId,
    });
  }

  public static async unreadMessage() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await OldTests.client.inbox.unread({
      messageId: messageId,
    });
  }

  public static async archiveMessage() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const userId = OldTests.client.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await OldTests.client.inbox.archive({
      messageId: messageId,
    });
  }

  public static async readAllMessages() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    await OldTests.client.inbox.readAll();
  }

  public static async getUserPreferences() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    return await OldTests.client.preferences.getUserPreferences({
      paginationCursor: undefined,
    });
  }

  public static async getUserPreferenceTopic() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const topicId = '35K24W99WCME21MRG7X2BPDF6CK7';

    return await OldTests.client.preferences.getUserPreferenceTopic({
      topicId: topicId,
    });
  }

  public static async putUserPreferenceTopic() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    const topicId = '35K24W99WCME21MRG7X2BPDF6CK7';

    return await OldTests.client.preferences.putUserPreferenceTopic({
      topicId: topicId,
      status: CourierUserPreferencesStatus.OptedIn,
      hasCustomRouting: true,
      customRouting: [CourierUserPreferencesChannel.Email, CourierUserPreferencesChannel.Push]
    });
  }

  public static async testTracking() {
    if (!OldTests.client) {
      throw new Error("Client is undefined");
    }

    await OldTests.client.tracking.postTrackingUrl({
      url: 'https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy',
      event: CourierTrackingEvent.Delivered,
    });
  }

  public static async testRemoveClient() {

    OldTests.client?.remove();

  }

  public static async testSignIn() {

    const userId = Utils.generateUUID();

    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    await Courier.shared.signIn({
      userId: userId,
      accessToken: token,
      clientKey: Env.clientKey,
      showLogs: true,
    });

    return {
      userId: Courier.shared.userId,
      tenantId: Courier.shared.tenantId,
      isUserSignedIn: Courier.shared.isUserSignedIn,
    };

  }

  public static async testAuthenticationListener() {

    const authListener = Courier.shared.addAuthenticationListener({
      onUserChanged: (userId?: string) => {
        console.log(`User Changed: ${userId}`);
      }
    });

    authListener.remove();

  }

  public static async testSharedClient() {

    const client = Courier.shared.client;

    return client?.options;

  }

  public static async testPushListener() {

    const pushListener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked: (message) => {
        console.log('onPushNotificationClicked');
        console.log(message);
      },
      onPushNotificationDelivered: (message) => {
        console.log('onPushNotificationDelivered');
        console.log(message);
      }
    });

    pushListener.remove();

  }

  public static async testRemoveAllPushNotificationListeners() {

    Courier.shared.removeAllPushNotificationListeners();
    
  }

  public static async testSetTokenForProvider() {

    await Courier.shared.setTokenForProvider({
      provider: CourierPushProvider.FIREBASE_FCM,
      token: 'example',
    });

    await Courier.shared.setTokenForProvider({
      provider: CourierPushProvider.EXPO,
      token: 'example',
    });

  }

  public static async testGetTokenForProvider() {

    return await Courier.shared.getTokenForProvider({ 
      provider: CourierPushProvider.FIREBASE_FCM,
    });

  }

  public static async testGetAllTokens() {
    const tokensMap = await Courier.shared.getAllTokens();
    const tokensObject = Object.fromEntries(tokensMap);
    return tokensObject;
  }

  public static async testInboxPaginationLimit() {

    Courier.shared.inboxPaginationLimit = 1;

    return Courier.shared.inboxPaginationLimit;

  }

  public static async testOpenMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';
    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.openMessage({
      messageId: messageId,
    });
  }

  public static async testClickMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';
    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.clickMessage({
      messageId: messageId,
    });
  }

  public static async testReadMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';
    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.readMessage({
      messageId: messageId,
    });
  }

  public static async testUnreadMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';
    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.unreadMessage({
      messageId: messageId,
    });
  }

  public static async testArchiveMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';
    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.unreadMessage({
      messageId: messageId,
    });
  }

  public static async testReadAllInboxMessages() {

    await Courier.shared.readAllInboxMessages();
    
  }
    

  public static async testInboxListener() {

    const inboxListener = Courier.shared.addInboxListener({
      onInitialLoad: () => {
        console.log('onInitialLoad');
      },
      onError: (error) => {
        console.log('onError');
        console.log(error);
      },
      onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
        console.log('onMessagesChanged');
        console.log(messages.length > 0 ? messages[0]?.messageId : 'No messages');
        console.log(unreadMessageCount);
        console.log(totalMessageCount);
        console.log(canPaginate);
      },
    });

    inboxListener.remove();

  }

  public static async testRemoveAllInboxListeners() {

    Courier.shared.removeAllInboxListeners();

  }

  public static async testRefreshInbox() {

    return await Courier.shared.refreshInbox();

  }

  public static async testFetchNextPageOfMessages() {

    return await Courier.shared.fetchNextPageOfMessages();

  }

  public static async testSignOut() {

    await Courier.shared.signOut();

  }

  public static async testRequestPushNotificationPermission() {

    return await Courier.requestNotificationPermission();

  }

  public static async testGetNotificationPermissionStatus() {

    return await Courier.getNotificationPermissionStatus();

  }

  public static async testSetIOSForegroundPresentationOptions() {

    const options: iOSForegroundPresentationOptions[] = ['banner']

    Courier.setIOSForegroundPresentationOptions({
      options: options
    });

    return options

  }

  public static async testOpenSettingsForApp() {

    Courier.openSettingsForApp();

  }

  public static async testSendInboxMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';

    return await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'inbox' });
  }

  public static async testSendAPNSMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';

    return await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'apn' });
  }

  public static async testSendFCMMessage() {
    if (!Courier.shared.isUserSignedIn) {
      throw new Error("User is not signed in");
    }

    const userId = Courier.shared.userId ?? '';

    return await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'firebase-fcm' });
  }

}