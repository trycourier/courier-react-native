import Courier, { CourierClient, CourierUserPreferencesStatus, CourierUserPreferencesChannel, CourierTrackingEvent, CourierPushProvider } from "@trycourier/courier-react-native";
import Env from "./Env";
import { ExampleServer, Utils } from "./Utils";

export class IntegrationTests {

  public static client: CourierClient | undefined;

  public static async testClient() {

    const userId = Utils.generateUUID();
    
    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    IntegrationTests.client = new CourierClient({
      userId: userId,
      showLogs: true,
      jwt: token,
      clientKey: Env.clientKey,
      tenantId: undefined,
      connectionId: undefined,
    });

    return IntegrationTests.client?.options;

  }

  public static async testTokens() {

    await IntegrationTests.client?.tokens.putUserToken({
      token: 'example',
      provider: 'expo',
    });

    await IntegrationTests.client?.tokens.deleteUserToken({
      token: 'example',
    });

  }

  public static async testBrands() {

    return await IntegrationTests.client?.brands.getBrand({
      brandId: Env.brandId,
    });

  }

  public static async testMessages() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    return await IntegrationTests.client?.inbox.getMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });

  }

  public static async testUnreadCount() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    return await IntegrationTests.client?.inbox.getUnreadMessageCount();

  }

  public static async testArchivedMessages() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    return await IntegrationTests.client?.inbox.getArchivedMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });

  }

  public static async testMessageById() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    return await IntegrationTests.client?.inbox.getMessageById({
      messageId: messageId,
    });

  }

  public static async openMessage() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await IntegrationTests.client?.inbox.open({
      messageId: messageId,
    });
    
  }

  public static async clickMessage() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await IntegrationTests.client?.inbox.click({
      messageId: messageId,
      trackingId: 'tracking_example',
    });
    
  }

  public static async readMessage() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await IntegrationTests.client?.inbox.read({
      messageId: messageId,
    });
    
  }

  public static async unreadMessage() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await IntegrationTests.client?.inbox.unread({
      messageId: messageId,
    });
    
  }

  public static async archiveMessage() {

    const userId = IntegrationTests.client?.options.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await IntegrationTests.client?.inbox.archive({
      messageId: messageId,
    });
    
  }

  public static async readAllMessages() {

    await IntegrationTests.client?.inbox.readAll();
    
  }

  public static async getUserPreferences() {

    return await IntegrationTests.client?.preferences.getUserPreferences({
      paginationCursor: undefined,
    });
    
  }

  public static async getUserPreferenceTopic() {

    const topicId = '35K24W99WCME21MRG7X2BPDF6CK7';

    return await IntegrationTests.client?.preferences.getUserPreferenceTopic({
      topicId: topicId,
    });
    
  }

  public static async putUserPreferenceTopic() {

    const topicId = '35K24W99WCME21MRG7X2BPDF6CK7';

    return await IntegrationTests.client?.preferences.putUserPreferenceTopic({
      topicId: topicId,
      status: CourierUserPreferencesStatus.OptedIn,
      hasCustomRouting: true,
      customRouting: [CourierUserPreferencesChannel.Email, CourierUserPreferencesChannel.Push]
    });
    
  }

  public static async testTracking() {

    await IntegrationTests.client?.tracking.postTrackingUrl({
      url: 'https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy',
      event: CourierTrackingEvent.Delivered,
    });

  }

  public static async testRemoveClient() {

    IntegrationTests.client?.remove();

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

  public static async testRemovePushListener() {

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

    return await Courier.shared.getAllTokens();

  }

  public static async testInboxPaginationLimit() {

    Courier.shared.inboxPaginationLimit = 26;

    return Courier.shared.inboxPaginationLimit;

  }

  public static async testOpenMessage() {

    const userId = Courier.shared.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.openMessage({
      messageId: messageId,
    });

  }

  public static async testClickMessage() {

    const userId = Courier.shared.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.clickMessage({
      messageId: messageId,
    });

  }

  public static async testReadMessage() {

    const userId = Courier.shared.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.readMessage({
      messageId: messageId,
    });
    
  }

  public static async testUnreadMessage() {

    const userId = Courier.shared.userId ?? '';

    const messageId = await ExampleServer.sendTest({ authKey: Env.authKey, userId: userId, channel: 'push' });

    await Courier.shared.unreadMessage({
      messageId: messageId,
    });
    
  }

  public static async testArchiveMessage() {

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

  public static async testSignOut() {

    await Courier.shared.signOut();

  }

}