
import { ExampleServer } from "./Utils";
import Env from "./Env";
import Courier, { CourierClient, CourierPushProvider, CourierTrackingEvent, CourierUserPreferencesChannel, CourierUserPreferencesStatus } from "@trycourier/courier-react-native";

export class Tests {

  public static async run() {
    await Tests.clientTests();
    await Tests.sharedTests();
  }

  static async clientTests() {

    const userId = 'test_1';

    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    const client = new CourierClient({
      userId: userId,
      showLogs: true,
      jwt: token,
      clientKey: Env.clientKey,
      tenantId: undefined,
      connectionId: undefined,
    });

    // Tokens

    await client.tokens.putUserToken({
      token: 'example',
      provider: 'expo',
    });

    await client.tokens.deleteUserToken({
      token: 'example',
    });

    // Brands

    const brandRes = await client.brands.getBrand({
      brandId: Env.brandId,
    });
    console.log(JSON.stringify(brandRes));

    // Inbox

    const archivedMessages = await client.inbox.getArchivedMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
    console.log(JSON.stringify(archivedMessages));

    const allMessages = await client.inbox.getMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
    console.log(JSON.stringify(allMessages));

    const messageId = '1-666c88e3-2195b5495611a5b57ce0b134';

    const messageById = await client.inbox.getMessageById({
      messageId: messageId,
    });
    console.log(JSON.stringify(messageById));

    const unreadCount = await client.inbox.getUnreadMessageCount();
    console.log(JSON.stringify(unreadCount));

    await client.inbox.open({
      messageId: messageId,
    });

    await client.inbox.read({
      messageId: messageId,
    });

    await client.inbox.unread({
      messageId: messageId,
    });

    await client.inbox.click({
      messageId: messageId,
      trackingId: 'tracking_example',
    });

    await client.inbox.archive({
      messageId: '1-6633983a-3ee47af69c6147d41b85d91c',
    });

    await client.inbox.readAll();

    // Preferences

    const prefRes = await client.preferences.getUserPreferences({
      paginationCursor: undefined,
    });
    console.log(JSON.stringify(prefRes));

    const topicId = '35K24W99WCME21MRG7X2BPDF6CK7';

    const pref = await client.preferences.getUserPreferenceTopic({
      topicId: topicId,
    });
    console.log(JSON.stringify(pref));

    await client.preferences.putUserPreferenceTopic({
      topicId: topicId,
      status: CourierUserPreferencesStatus.OptedIn,
      hasCustomRouting: true,
      customRouting: [CourierUserPreferencesChannel.Email, CourierUserPreferencesChannel.Push]
    });

    // Tracking

    await client.tracking.postTrackingUrl({
      url: 'https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy',
      event: CourierTrackingEvent.Delivered,
    });

    client.remove();

  }

  static async sharedTests() {

    const userId = 'test_1';

    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    // Authentication

    const authListener = Courier.shared.addAuthenticationListener({
      onUserChanged: (userId?: string) => {
        console.log(`User Changed: ${userId}`);
      }
    });

    await Courier.shared.signIn({
      userId: userId,
      accessToken: token,
      clientKey: Env.clientKey,
      showLogs: true,
    });

    console.log({
      userId: Courier.shared.userId,
      tenantId: Courier.shared.tenantId,
      isUserSignedIn: Courier.shared.isUserSignedIn,
    });

    authListener.remove();

    // Client

    console.log('client');
    const client = Courier.shared.client;
    console.log(client?.options);

    const preferences = await client?.preferences.getUserPreferences();
    console.log(JSON.stringify(preferences));

    // Push

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

    await Courier.shared.setTokenForProvider({
      provider: CourierPushProvider.FIREBASE_FCM,
      token: 'example',
    });

    console.log({
      tokens: await Courier.shared.getAllTokens(),
      token: await Courier.shared.getTokenForProvider({ 
        provider: CourierPushProvider.FIREBASE_FCM,
      }),
    });

    pushListener.remove();

    // Inbox

    Courier.shared.inboxPaginationLimit = 26;

    console.log('inboxPaginationLimit')
    console.log(Courier.shared.inboxPaginationLimit)

    const messageId = '1-666c88e3-2195b5495611a5b57ce0b134';

    await Courier.shared.openMessage({
      messageId: messageId,
    });

    await Courier.shared.clickMessage({
      messageId: messageId,
    });

    await Courier.shared.readMessage({
      messageId: messageId,
    });

    await Courier.shared.unreadMessage({
      messageId: messageId,
    });

    await Courier.shared.archiveMessage({
      messageId: messageId,
    });

    await Courier.shared.readAllInboxMessages();

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

    // inboxListener.remove();
    // Courier.shared.removeAllInboxListeners();

    // Reset

    // await Courier.shared.signOut();

  }

}