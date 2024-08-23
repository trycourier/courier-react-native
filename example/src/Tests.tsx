
import { ExampleServer } from "./Utils";
import Env from "./Env";
import { CourierClient, CourierTrackingEvent, CourierUserPreferencesChannel, CourierUserPreferencesStatus } from "@trycourier/courier-react-native";

export class Tests {

  public static async run() {

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

    const allMessages = await client.inbox.getMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
    console.log(JSON.stringify(allMessages));

    const archivedMessages = await client.inbox.getArchivedMessages({
      paginationLimit: 123,
      startCursor: undefined,
    });
    console.log(JSON.stringify(archivedMessages));

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
      messageId: messageId,
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
      url: "https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy",
      event: CourierTrackingEvent.Delivered,
    })

    client.remove();

  }

}