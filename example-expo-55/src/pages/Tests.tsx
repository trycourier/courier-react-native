import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Courier, {
  CourierClient,
  CourierTrackingEvent,
  CourierUserPreferencesChannel,
  CourierUserPreferencesStatus,
  InboxMessage,
  iOSForegroundPresentationOptions,
} from '@trycourier/courier-react-native';
import Env from '../Env';
import { ExampleServer, Utils } from '../Utils';

let savedClient: CourierClient | undefined;

// A test fails when the call didn't do what it should, not only when it throws
const check = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const requireClient = (): CourierClient => {
  check(savedClient, 'Client not initialized. Run createClient first.');
  return savedClient!;
};

const requireSharedClient = async (): Promise<CourierClient> => {
  const client = await Courier.shared.getClient();
  check(client, 'No user is signed in. Run Sign In first.');
  return client!;
};

// Polls, because the server applies new messages and inbox events a moment later
const waitFor = async <T,>(
  read: () => Promise<T>,
  isDone: (value: T) => boolean,
  description: string,
  timeoutMs = 20000
): Promise<T> => {
  const start = Date.now();
  let value = await read();
  while (!isDone(value)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for ${description}`);
    }
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    value = await read();
  }
  return value;
};

const getMessage = async (client: CourierClient, messageId: string) => {
  try {
    const response = await client.inbox.getMessageById({ messageId });
    return response?.data?.message;
  } catch {
    return undefined;
  }
};

const waitForMessage = (
  client: CourierClient,
  messageId: string,
  isDone: (message: InboxMessage) => boolean,
  description: string
) =>
  waitFor(
    () => getMessage(client, messageId),
    (message) => !!message && isDone(message),
    `message ${messageId} to ${description}`
  );

const listMessages = async (client: CourierClient) => {
  const response = await client.inbox.getMessages({ paginationLimit: 25 });
  return response?.data?.messages?.nodes ?? [];
};

// The message list can trail the single message query by 20 seconds or more
const LIST_TIMEOUT_MS = 60000;

// Reads from the message list. It can trail the single message query by minutes.
const waitForListedMessage = (
  client: CourierClient,
  messageId: string,
  isDone: (message: InboxMessage) => boolean,
  description: string
) =>
  waitFor(
    async () =>
      (await listMessages(client)).find((m) => m.messageId === messageId),
    (message) => !!message && isDone(message),
    `message ${messageId} to ${description}`,
    LIST_TIMEOUT_MS
  );

// Sends an inbox message to the client's user and waits until it can be fetched
const sendInboxMessage = async (client: CourierClient): Promise<string> => {
  const messageId = await ExampleServer.sendTest({
    authKey: Env.authKey,
    userId: client.options.userId,
    channel: 'inbox',
  });
  await waitForMessage(
    client,
    messageId,
    (message) => message.messageId === messageId,
    'arrive'
  );
  return messageId;
};

const sendListedInboxMessage = async (client: CourierClient) => {
  const messageId = await sendInboxMessage(client);
  await waitForListedMessage(client, messageId, () => true, 'be listed');
  return messageId;
};

// Courier.shared's message actions only change messages in the loaded inbox,
// as in a custom inbox list, so this loads the inbox and waits for the message first.
// A new message is sent after the inbox loads, so it arrives over the realtime socket
// instead of waiting for the message list to show it.
const withLoadedMessage = async (
  client: CourierClient,
  messageIdParam: string | undefined,
  action: (messageId: string) => Promise<void>
): Promise<string> => {
  const loaded = new Set<string>();
  const addMessages = (messages: InboxMessage[]) =>
    messages.forEach((m) => loaded.add(m.messageId));
  const listener = await Courier.shared.addInboxListener({
    onMessagesChanged: (messages) => addMessages(messages),
    onPageAdded: (messages) => addMessages(messages),
    onMessageEvent: (message) => loaded.add(message.messageId),
  });
  try {
    await Courier.shared.refreshInbox();
    const messageId = messageIdParam ?? (await sendInboxMessage(client));

    // Refreshes now and then in case the socket missed it
    let reads = 0;
    await waitFor(
      async () => {
        reads += 1;
        if (!loaded.has(messageId) && reads % 15 === 0) {
          await Courier.shared.refreshInbox();
        }
        return loaded.has(messageId);
      },
      (isLoaded) => isLoaded,
      `the shared inbox to load message ${messageId}`,
      LIST_TIMEOUT_MS
    );
    await action(messageId);
    return messageId;
  } finally {
    await listener.remove();
  }
};

// The single message query always returns opened as null, and the message list shows
// an open minutes late, so this reads the open from the server's message record
const waitForOpened = (messageId: string) =>
  waitFor(
    () => ExampleServer.getMessage({ authKey: Env.authKey, messageId }),
    (message) => !!message?.opened,
    `message ${messageId} to be opened`
  );

// Read all only reaches messages already in the message list, so the check uses the
// unread ones listed when it runs. Messages the list shows later can still be unread.
const checkReadAll = async (
  client: CourierClient,
  readAll: () => Promise<unknown>
) => {
  let unread = (await listMessages(client)).filter((m) => !m.read);
  if (unread.length === 0) {
    await sendListedInboxMessage(client);
    unread = (await listMessages(client)).filter((m) => !m.read);
  }
  await readAll();
  for (const message of unread) {
    await waitForMessage(
      client,
      message.messageId,
      (m) => !!m.read,
      'be read by read all'
    );
  }
};

const userTokens = (userId: string) =>
  ExampleServer.getUserTokens({ authKey: Env.authKey, userId });

const IntegrationTests: Record<string, (params: any) => Promise<any>> = {
  createClient: async (params: {
    userId: string;
    clientKey: string;
    jwt?: string;
    showLogs: boolean;
    tenantId?: string;
    connectionId?: string;
  }) => {
    const token =
      params.jwt ??
      (await ExampleServer.generateJwt({
        authKey: Env.authKey,
        userId: params.userId,
      }));
    check(token, 'No JWT was issued. Check authKey in Env.tsx.');

    savedClient = new CourierClient({
      userId: params.userId,
      showLogs: params.showLogs,
      jwt: token,
      clientKey: params.clientKey,
      tenantId: params.tenantId,
      connectionId: params.connectionId,
    });

    check(
      savedClient.options.userId === params.userId,
      `Client has user ${savedClient.options.userId}, expected ${params.userId}`
    );

    return {
      id: savedClient.clientId,
      options: savedClient.options,
    };
  },

  removeClient: async (params: { clientId?: string }) => {
    let id = params.clientId;

    if (savedClient) {
      id = savedClient.clientId;
      savedClient.remove();
      savedClient = undefined;
    }
    return {
      clientId: id,
    };
  },

  testPutToken: async (params: { token: string; provider: string }) => {
    const client = requireClient();
    await client.tokens.putUserToken({
      provider: params.provider,
      token: params.token,
    });
    await waitFor(
      () => userTokens(client.options.userId),
      (tokens) =>
        tokens.some(
          (t) => t.token === params.token && t.provider_key === params.provider
        ),
      `token ${params.token} to be saved for ${params.provider}`
    );
    return { token: params.token, provider: params.provider };
  },

  testDeleteToken: async (params: { token: string }) => {
    const client = requireClient();
    await client.tokens.deleteUserToken({ token: params.token });
    await waitFor(
      () => userTokens(client.options.userId),
      (tokens) => !tokens.some((t) => t.token === params.token),
      `token ${params.token} to be deleted`
    );
  },

  testGetBrands: async (params: { brandId: string }) => {
    const client = requireClient();
    check(params.brandId, 'brandId is empty. Set it in Env.tsx.');
    const brand = await client.brands.getBrand({
      brandId: params.brandId,
    });
    check(brand?.data?.brand, `Brand ${params.brandId} was not returned`);
    return brand;
  },

  testMessages: async (params: {
    paginationLimit: number;
    startCursor?: string;
  }) => {
    const client = requireClient();
    const response = await client.inbox.getMessages({
      paginationLimit: params.paginationLimit,
      startCursor: params.startCursor,
    });
    const messages = response?.data?.messages?.nodes;
    check(Array.isArray(messages), 'No message list was returned');
    check(
      messages!.length <= params.paginationLimit,
      `Got ${messages!.length} messages for a limit of ${params.paginationLimit}`
    );
    return response;
  },

  testUnreadCount: async () => {
    const client = requireClient();
    const count = await client.inbox.getUnreadMessageCount();
    console.log('Unread Count:', count);
    check(
      typeof count === 'number' && count >= 0,
      `Unread count is ${count}`
    );
    return count;
  },

  testArchivedMessages: async (params: {
    paginationLimit: number;
    startCursor?: string;
  }) => {
    const client = requireClient();
    const response = await client.inbox.getArchivedMessages({
      paginationLimit: params.paginationLimit,
      startCursor: params.startCursor,
    });
    check(
      Array.isArray(response?.data?.messages?.nodes),
      'No archived message list was returned'
    );
    return response;
  },

  testMessageById: async (params: { messageId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));
    const response = await client.inbox.getMessageById({ messageId });
    check(
      response?.data?.message?.messageId === messageId,
      `Message ${messageId} was not returned`
    );
    return response;
  },

  openMessage: async (params: { messageId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));
    await client.inbox.open({ messageId });
    await waitForOpened(messageId);
    return { messageId };
  },

  clickMessage: async (params: { messageId?: string; trackingId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));

    // A click only records an event, so there's no message state to check afterwards
    await client.inbox.click({
      messageId,
      trackingId: params.trackingId ?? 'test-tracking-id',
    });
    return { messageId };
  },

  readMessage: async (params: { messageId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));
    await client.inbox.read({ messageId });
    await waitForMessage(client, messageId, (m) => !!m.read, 'be read');
    return { messageId };
  },

  unreadMessage: async (params: { messageId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));

    // Read it first, so unread has something to undo
    await client.inbox.read({ messageId });
    await waitForMessage(client, messageId, (m) => !!m.read, 'be read');
    await client.inbox.unread({ messageId });
    await waitForMessage(client, messageId, (m) => !m.read, 'be unread');
    return { messageId };
  },

  archiveMessage: async (params: { messageId?: string }) => {
    const client = requireClient();
    const messageId = params.messageId ?? (await sendInboxMessage(client));
    await client.inbox.archive({ messageId });
    await waitForMessage(
      client,
      messageId,
      (m) => !!m.archived,
      'be archived'
    );
    return { messageId };
  },

  readAllMessages: async () => {
    const client = requireClient();
    await checkReadAll(client, () => client.inbox.readAll());
  },

  testGetPreferences: async () => {
    const client = requireClient();
    const preferences = await client.preferences.getUserPreferences();
    check(
      Array.isArray(preferences?.items),
      'No preference topics were returned'
    );
    return preferences;
  },

  testUpdatePreferences: async (params: {
    topicId: string;
    status: string;
    hasCustomRouting: boolean;
    customRouting: string;
  }) => {
    const client = requireClient();
    check(params.topicId, 'topicId is empty. Set it in Env.tsx.');
    const customRouting = params.customRouting
      .split(',')
      .map((channel) => channel.trim() as CourierUserPreferencesChannel);
    await client.preferences.putUserPreferenceTopic({
      topicId: params.topicId,
      status: params.status as CourierUserPreferencesStatus,
      hasCustomRouting: params.hasCustomRouting,
      customRouting: customRouting,
    });
    const topic = await waitFor(
      () => client.preferences.getUserPreferenceTopic({ topicId: params.topicId }),
      (t) => t?.status === params.status,
      `topic ${params.topicId} to be ${params.status}`
    );
    check(
      topic.hasCustomRouting === params.hasCustomRouting,
      `hasCustomRouting is ${topic.hasCustomRouting}, expected ${params.hasCustomRouting}`
    );
    return topic;
  },

  testGetPreferenceTopics: async (params: { topicId: string }) => {
    const client = requireClient();
    check(params.topicId, 'topicId is empty. Set it in Env.tsx.');
    const topic = await client.preferences.getUserPreferenceTopic({
      topicId: params.topicId,
    });
    check(
      topic?.topicId === params.topicId,
      `Topic ${params.topicId} was not returned`
    );
    return topic;
  },

  testPostTrackingUrl: async (params: {
    trackingUrl: string;
    event: string;
  }) => {
    const client = requireClient();
    return await client.tracking.postTrackingUrl({
      url: params.trackingUrl,
      event: params.event as CourierTrackingEvent,
    });
  },

  testSignIn: async (params: {
    userId: string;
    accessToken?: string;
    clientKey: string;
    tenantId: string;
    showLogs: boolean;
  }) => {
    const token =
      params.accessToken ??
      (await ExampleServer.generateJwt({
        authKey: Env.authKey,
        userId: params.userId,
      }));

    await Courier.shared.signIn({
      userId: params.userId,
      accessToken: token,
      clientKey: params.clientKey,
      tenantId: params.tenantId,
      showLogs: params.showLogs,
    });

    const userId = await Courier.shared.getUserId();
    check(
      userId === params.userId,
      `Signed in as ${userId}, expected ${params.userId}`
    );
    check(
      await Courier.shared.isUserSignedIn(),
      'isUserSignedIn is false after signIn'
    );
    const tenantId = await Courier.shared.getTenantId();
    check(
      (tenantId || undefined) === (params.tenantId || undefined),
      `Tenant is ${tenantId}, expected ${params.tenantId}`
    );

    const client = await requireSharedClient();
    return client.options;
  },

  testGetUserId: async () => {
    const userId = await Courier.shared.getUserId();
    check(userId, 'No user ID. Run Sign In first.');
    return userId;
  },

  testGetTenantId: async () => {
    return await Courier.shared.getTenantId();
  },

  testGetIsUserSignedIn: async () => {
    const signedIn = await Courier.shared.isUserSignedIn();
    check(signedIn === true, 'isUserSignedIn is false. Run Sign In first.');
    return signedIn;
  },

  testAuthenticationListener: async () => {
    const listener = await Courier.shared.addAuthenticationListener({
      onUserChanged: (userId) => {
        console.log('User changed:', userId);
      },
    });
    check(listener?.listenerId, 'The listener has no ID');
    listener.remove();
    return listener.listenerId;
  },

  testRemoveAllAuthenticationListeners: async () => {
    return Courier.shared.removeAllAuthenticationListeners();
  },

  testSignOut: async () => {
    await Courier.shared.signOut();
    check(
      !(await Courier.shared.isUserSignedIn()),
      'isUserSignedIn is still true after signOut'
    );
    check(
      !(await Courier.shared.getUserId()),
      'A user ID is still set after signOut'
    );
  },

  testGetClient: async () => {
    const client = await requireSharedClient();
    const userId = await Courier.shared.getUserId();
    check(
      client.options.userId === userId,
      `Client has user ${client.options.userId}, expected ${userId}`
    );
    return {
      clientId: client.clientId,
      options: client.options,
    };
  },

  testGetAllTokens: async () => {
    const tokens = await Courier.shared.getAllTokens();
    const tokenObject: Record<string, string> = {};
    tokens.forEach((value, key) => {
      tokenObject[key] = value;
    });
    check(Object.keys(tokenObject).length > 0, 'No tokens were returned');
    return tokenObject;
  },

  testGetToken: async (params: { provider: string }) => {
    const token = await Courier.shared.getToken({ key: params.provider });
    check(token, `No ${params.provider} token. Run Set Token first.`);
    return token;
  },

  testSetToken: async (params: { provider: string; token: string }) => {
    await Courier.shared.setToken({
      key: params.provider,
      token: params.token,
    });
    const token = await Courier.shared.getToken({ key: params.provider });
    check(
      token === params.token,
      `getToken returned ${token}, expected ${params.token}`
    );

    // setToken also uploads the token for the signed-in user
    const userId = await Courier.shared.getUserId();
    if (userId) {
      await waitFor(
        () => userTokens(userId),
        (tokens) => tokens.some((t) => t.token === params.token),
        `token ${params.token} to be saved for ${userId}`
      );
    }
    return token;
  },

  testAddPushNotificationListener: async () => {
    const listener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked: (push) => {
        console.log('Push notification clicked:', push);
      },
    });
    check(listener?.listenerId, 'The listener has no ID');
    listener.remove();
    return listener.listenerId;
  },

  testRemoveAllPushNotificationListeners: async () => {
    return Courier.shared.removeAllPushNotificationListeners();
  },

  testSetInboxPaginationLimit: async (params: { limit: number }) => {
    await Courier.shared.setInboxPaginationLimit(params.limit);
    const limit = await Courier.shared.getInboxPaginationLimit();
    check(
      Number(limit) === Number(params.limit),
      `Pagination limit is ${limit}, expected ${params.limit}`
    );
  },

  testGetInboxPaginationLimit: async () => {
    const limit = await Courier.shared.getInboxPaginationLimit();
    check(limit > 0, `Pagination limit is ${limit}`);
    return limit;
  },

  testOpenMessage: async (params: { messageId?: string }) => {
    const client = await requireSharedClient();
    const messageId = await withLoadedMessage(
      client,
      params.messageId,
      (id) => Courier.shared.openMessage({ messageId: id })
    );
    await waitForOpened(messageId);
    return { messageId };
  },

  testClickMessage: async (params: { messageId?: string }) => {
    const client = await requireSharedClient();

    // A click only records an event, so there's no message state to check afterwards
    const messageId = await withLoadedMessage(
      client,
      params.messageId,
      (id) => Courier.shared.clickMessage({ messageId: id })
    );
    return { messageId };
  },

  testReadMessage: async (params: { messageId?: string }) => {
    const client = await requireSharedClient();
    const messageId = await withLoadedMessage(
      client,
      params.messageId,
      (id) => Courier.shared.readMessage({ messageId: id })
    );
    await waitForMessage(client, messageId, (m) => !!m.read, 'be read');
    return { messageId };
  },

  testUnreadMessage: async (params: { messageId?: string }) => {
    const client = await requireSharedClient();

    // Read it first, so unread has something to undo
    const messageId = await withLoadedMessage(
      client,
      params.messageId,
      async (id) => {
        await Courier.shared.readMessage({ messageId: id });
        await waitForMessage(client, id, (m) => !!m.read, 'be read');
        await Courier.shared.unreadMessage({ messageId: id });
      }
    );
    await waitForMessage(client, messageId, (m) => !m.read, 'be unread');
    return { messageId };
  },

  testArchiveMessage: async (params: { messageId?: string }) => {
    const client = await requireSharedClient();
    const messageId = await withLoadedMessage(
      client,
      params.messageId,
      (id) => Courier.shared.archiveMessage({ messageId: id })
    );
    await waitForMessage(
      client,
      messageId,
      (m) => !!m.archived,
      'be archived'
    );
    return { messageId };
  },

  testReadAllInboxMessages: async () => {
    const client = await requireSharedClient();
    await checkReadAll(client, () => Courier.shared.readAllInboxMessages());
  },

  testAddInboxListener: async () => {
    let loaded = false;
    let error: string | undefined;
    const listener = await Courier.shared.addInboxListener({
      onLoading: (isRefresh: boolean) => {
        console.log('Inbox loading:', isRefresh);
      },
      onError: (message: string) => {
        console.log('Inbox error:', message);
        error = message;
      },
      onUnreadCountChanged: (unreadCount: number) => {
        console.log('Inbox unread count changed:', unreadCount);
      },
      onTotalCountChanged: (totalCount: number, feed: string) => {
        console.log('Inbox total count changed:', totalCount, feed);
      },
      onMessagesChanged: (
        messages: InboxMessage[],
        canPaginate: boolean,
        feed: string
      ) => {
        console.log('Inbox messages changed:', messages, canPaginate, feed);
        loaded = true;
      },
      onPageAdded: (
        messages: InboxMessage[],
        canPaginate: boolean,
        isFirstPage: boolean,
        feed: string
      ) => {
        console.log(
          'Inbox page added:',
          messages,
          canPaginate,
          isFirstPage,
          feed
        );
        loaded = true;
      },
      onMessageEvent: (
        message: InboxMessage,
        index: number,
        feed: string,
        eventName: string
      ) => {
        console.log('Inbox message event:', message, index, feed, eventName);
      },
    });

    // A new listener should get the inbox's messages, not just an ID
    try {
      await waitFor(
        async () => loaded || !!error,
        (done) => done,
        'the listener to receive the inbox'
      );
      check(!error, `The inbox listener got an error: ${error}`);
    } finally {
      await listener.remove();
    }
    return listener;
  },

  testRemoveAllInboxListeners: async () => {
    return Courier.shared.removeAllInboxListeners();
  },

  testRefreshInbox: async () => {
    return await Courier.shared.refreshInbox();
  },

  testFetchNextPageOfMessages: async () => {
    const messages = await Courier.shared.fetchNextPageOfMessages({
      inboxMessageFeed: 'feed',
    });
    check(Array.isArray(messages), 'No message list was returned');
    return messages;
  },

  testRequestPushNotificationPermission: async () => {
    const status = await Courier.requestNotificationPermission();
    check(status, 'No permission status was returned');
    return status;
  },

  testGetPushNotificationPermissionStatus: async () => {
    const status = await Courier.getNotificationPermissionStatus();
    check(status, 'No permission status was returned');
    return status;
  },

  testSetIOSForegroundPresentationOptions: async (params: {
    options: iOSForegroundPresentationOptions[];
  }) => {
    return Courier.setIOSForegroundPresentationOptions({
      options: params.options,
    });
  },

  testOpenSettingsForApp: async () => {
    return Courier.openSettingsForApp();
  },

  testSendInboxMessage: async (params: {
    userId: string;
    title?: string;
    body?: string;
  }) => {
    const messageId = await ExampleServer.sendTest({
      authKey: Env.authKey,
      userId: params.userId,
      channel: 'inbox',
      title: params.title ?? 'Test',
      body: params.body ?? 'Body',
    });
    return { messageId: messageId };
  },

  testSendApnMessage: async (params: {
    userId: string;
    title?: string;
    body?: string;
  }) => {
    const messageId = await ExampleServer.sendTest({
      authKey: Env.authKey,
      userId: params.userId,
      channel: 'apn',
      title: params.title ?? 'Test',
      body: params.body ?? 'Body',
    });
    return { messageId: messageId };
  },

  testSendFcmMessage: async (params: {
    userId: string;
    title?: string;
    body?: string;
  }) => {
    const messageId = await ExampleServer.sendTest({
      authKey: Env.authKey,
      userId: params.userId,
      channel: 'firebase-fcm',
      title: params.title ?? 'Test',
      body: params.body ?? 'Body',
    });
    return { messageId: messageId };
  },
};

type TestItem = {
  name: string;
  testId: string;
  defaultParams: Record<string, string | boolean | number | undefined>;
  runOrder: 'normal' | 'run at end' | 'skip';
};

type TestSection = {
  title: string;
  tests: TestItem[];
};

const getTestSections = async (): Promise<TestSection[]> => [
  {
    title: 'Client Management',
    tests: [
      {
        name: 'Create Client',
        testId: 'createClient',
        defaultParams: {
          userId: Utils.generateUUID(),
          clientKey: Env.clientKey,
          showLogs: true,
          tenantId: undefined,
          connectionId: undefined,
        },
        runOrder: 'normal',
      },
      {
        name: 'Remove Client',
        testId: 'removeClient',
        defaultParams: { clientId: savedClient?.clientId },
        runOrder: 'skip',
      },
    ],
  },
  {
    title: 'Tokens',
    tests: [
      {
        name: 'Put Token',
        testId: 'testPutToken',
        defaultParams: { token: 'test-token', provider: 'test-provider' },
        runOrder: 'normal',
      },
      {
        name: 'Delete Token',
        testId: 'testDeleteToken',
        defaultParams: { token: 'test-token' },
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Brands',
    tests: [
      {
        name: 'Get Brand',
        testId: 'testGetBrands',
        defaultParams: { brandId: Env.brandId },
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Inbox',
    tests: [
      {
        name: 'Get Messages',
        testId: 'testMessages',
        defaultParams: { paginationLimit: 10, paginationCursor: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Get Unread Count',
        testId: 'testUnreadCount',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Get Archived Messages',
        testId: 'testArchivedMessages',
        defaultParams: { paginationLimit: 10, paginationCursor: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Get Message By ID',
        testId: 'testMessageById',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Open Message',
        testId: 'openMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Click Message',
        testId: 'clickMessage',
        defaultParams: { messageId: undefined, trackingId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Read Message',
        testId: 'readMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Unread Message',
        testId: 'unreadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Archive Message',
        testId: 'archiveMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Read All Messages',
        testId: 'readAllMessages',
        defaultParams: {},
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Preferences',
    tests: [
      {
        name: 'Get Preferences',
        testId: 'testGetPreferences',
        defaultParams: { paginationCursor: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Update Preferences',
        testId: 'testUpdatePreferences',
        defaultParams: {
          topicId: Env.topicId,
          status: 'OPTED_IN',
          hasCustomRouting: true,
          customRouting: 'push,sms,email',
        },
        runOrder: 'normal',
      },
      {
        name: 'Get Preference Topics',
        testId: 'testGetPreferenceTopics',
        defaultParams: { topicId: Env.topicId },
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Tracking',
    tests: [
      {
        name: 'Post Tracking Url',
        testId: 'testPostTrackingUrl',
        defaultParams: {
          trackingUrl:
            'https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy',
          event: 'delivered',
        },
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Shared Authentication',
    tests: [
      {
        name: 'Sign In',
        testId: 'testSignIn',
        defaultParams: {
          userId: Utils.generateUUID(),
          accessToken: undefined,
          clientKey: Env.clientKey,
          tenantId: undefined,
          showLogs: true,
        },
        runOrder: 'normal',
      },
      {
        name: 'Get User ID',
        testId: 'testGetUserId',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Get Tenant ID',
        testId: 'testGetTenantId',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Get Is User Signed In',
        testId: 'testGetIsUserSignedIn',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Add Authentication Listener',
        testId: 'testAuthenticationListener',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Remove All Authentication Listeners',
        testId: 'testRemoveAllAuthenticationListeners',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Sign Out',
        testId: 'testSignOut',
        defaultParams: {},
        runOrder: 'skip',
      },
    ],
  },
  {
    title: 'Shared Client',
    tests: [
      {
        name: 'Get Client',
        testId: 'testGetClient',
        defaultParams: {},
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'Shared Push',
    tests: [
      {
        name: 'Set Token',
        testId: 'testSetToken',
        defaultParams: { provider: 'expo', token: 'test-token' },
        runOrder: 'normal',
      },
      {
        name: 'Get Token',
        testId: 'testGetToken',
        defaultParams: { provider: 'expo' },
        runOrder: 'normal',
      },
      {
        name: 'Get All Tokens',
        testId: 'testGetAllTokens',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Add Push Notification Listener',
        testId: 'testAddPushNotificationListener',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Remove All Push Notification Listeners',
        testId: 'testRemoveAllPushNotificationListeners',
        defaultParams: {},
        runOrder: 'skip',
      },
    ],
  },
  {
    title: 'Shared Inbox',
    tests: [
      {
        name: 'Set Inbox Pagination Limit',
        testId: 'testSetInboxPaginationLimit',
        defaultParams: { limit: 20 },
        runOrder: 'normal',
      },
      {
        name: 'Get Inbox Pagination Limit',
        testId: 'testGetInboxPaginationLimit',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Open Message',
        testId: 'testOpenMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Click Message',
        testId: 'testClickMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Read Message',
        testId: 'testReadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Unread Message',
        testId: 'testUnreadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Archive Message',
        testId: 'testArchiveMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal',
      },
      {
        name: 'Read All Inbox Messages',
        testId: 'testReadAllInboxMessages',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Add Inbox Listener',
        testId: 'testAddInboxListener',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Remove All Inbox Listeners',
        testId: 'testRemoveAllInboxListeners',
        defaultParams: {},
        runOrder: 'skip',
      },
      {
        name: 'Refresh Inbox',
        testId: 'testRefreshInbox',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Fetch Next Page of Messages',
        testId: 'testFetchNextPageOfMessages',
        defaultParams: {},
        runOrder: 'normal',
      },
    ],
  },
  {
    title: 'System',
    tests: [
      {
        name: 'Request Push Notification Permission',
        testId: 'testRequestPushNotificationPermission',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Get Push Notification Permission Status',
        testId: 'testGetPushNotificationPermissionStatus',
        defaultParams: {},
        runOrder: 'normal',
      },
      {
        name: 'Set iOS Foreground Presentation Options',
        testId: 'testSetIOSForegroundPresentationOptions',
        defaultParams: { options: 'badge,sound,list,banner' },
        runOrder: 'normal',
      },
      {
        name: 'Open Settings for App',
        testId: 'testOpenSettingsForApp',
        defaultParams: {},
        // It leaves the app, which stalls the rest of a full run
        runOrder: 'skip',
      },
    ],
  },
  {
    title: 'Send',
    tests: [
      {
        name: 'Send Inbox Message',
        testId: 'testSendInboxMessage',
        defaultParams: {
          userId:
            (await Courier.shared.getUserId()) ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body',
        },
        runOrder: 'normal',
      },
      {
        name: 'Send APN Message',
        testId: 'testSendApnMessage',
        defaultParams: {
          userId:
            (await Courier.shared.getUserId()) ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body',
        },
        runOrder: 'normal',
      },
      {
        name: 'Send FCM Message',
        testId: 'testSendFcmMessage',
        defaultParams: {
          userId:
            (await Courier.shared.getUserId()) ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body',
        },
        runOrder: 'normal',
      },
    ],
  },
];

const TestItem = ({
  item,
  onPress,
}: {
  item: { name: string; result?: unknown; status?: string; runOrder?: string };
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={[
        styles.testItem,
        item.status === 'running' && styles.runningTestItem,
      ]}
    >
      <View style={styles.testItemContent}>
        <Text style={styles.testItemTitle}>{item.name}</Text>
        {item.status !== undefined && item.status !== 'running' && (
          <Text style={styles.testItemResult}>
            {item.result !== undefined
              ? typeof item.result === 'number'
                ? item.result.toString()
                : JSON.stringify(item.result, null, 2)
              : 'No Response'}
          </Text>
        )}
      </View>
      <View style={styles.testItemStatus}>
        {item.status === undefined ? (
          <Text style={styles.statusEmoji}>🧪</Text>
        ) : item.status === 'running' ? (
          <ActivityIndicator size="small" />
        ) : item.status === 'skipped' ? (
          <Text style={styles.statusEmoji}>⚠️</Text>
        ) : (
          <Text style={styles.statusEmoji}>
            {item.status === 'success' ? '✅' : '❌'}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const Tests = () => {
  const navigation = useNavigation();
  const [testSections, setTestSections] = useState<TestSection[]>([]);
  const [testResults, setTestResults] = useState<
    Array<{
      name: string;
      result?: unknown;
      status?: string;
      runOrder?: string;
    }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  useEffect(() => {
    const loadTests = async () => {
      const sections = await getTestSections();
      setTestSections(sections);
      setTestResults(
        sections.flatMap((section) =>
          section.tests.map((test) => ({
            name: test.name,
            runOrder: test.runOrder,
          }))
        )
      );
      setTotalTests(sections.flatMap((section) => section.tests).length);
    };
    loadTests();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={runAllTests}
          disabled={isRunning}
          style={{ marginRight: 22 }}
        >
          {isRunning ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text
              style={[
                styles.runTestsButton,
                isRunning && styles.disabledButton,
              ]}
            >
              Run Tests
            </Text>
          )}
        </TouchableOpacity>
      ),
      headerTitle: isRunning
        ? `Running Test ${currentTestIndex + 1}/${totalTests}`
        : 'Tests',
    });
  }, [isRunning, currentTestIndex, testSections, totalTests]);

  const handleTestError = (error: unknown) => {
    let errorMessage = 'An unknown error occurred';
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
      };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = String(error);
      errorDetails = { ...error };
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return { errorMessage, errorDetails };
  };

  const runAllTests = async () => {
    if (isRunning) return;

    setTestResults((prev) =>
      prev.map((item) => ({
        ...item,
        status: undefined,
        result: undefined,
      }))
    );

    setIsRunning(true);
    setCurrentTestIndex(0);
    const normalTests = testSections.flatMap((section) =>
      section.tests.filter((test) => test.runOrder === 'normal')
    );
    const endTests = testSections.flatMap((section) =>
      section.tests.filter((test) => test.runOrder === 'run at end')
    );
    const skipTests = testSections.flatMap((section) =>
      section.tests.filter((test) => test.runOrder === 'skip')
    );

    for (let i = 0; i < normalTests.length; i++) {
      setCurrentTestIndex(i);
      await runSingleTest(normalTests[i]!);
    }

    for (let i = 0; i < endTests.length; i++) {
      setCurrentTestIndex(normalTests.length + i);
      await runSingleTest(endTests[i]!);
    }

    for (const test of skipTests) {
      setTestResults((prev) =>
        prev.map((t) =>
          t.name === test.name ? { ...t, status: 'skipped' } : t
        )
      );
    }

    setIsRunning(false);
    setCurrentTestIndex(0);
  };

  const runSingleTest = async (test: TestItem) => {
    setTestResults((prev) =>
      prev.map((t) =>
        t.name === test.name
          ? { ...t, status: 'running', result: undefined }
          : t
      )
    );
    setModalVisible(false); // Close the modal when the test starts
    try {
      const testFunction = IntegrationTests[test.testId];
      if (typeof testFunction === 'function') {
        const result = await testFunction(test.defaultParams);
        setTestResults((prev) =>
          prev.map((t) =>
            t.name === test.name ? { ...t, result, status: 'success' } : t
          )
        );
      } else {
        throw new Error(`Test function '${test.testId}' not found`);
      }
    } catch (error) {
      const { errorMessage, errorDetails } = handleTestError(error);

      console.log('Test failed:', {
        testName: test.name,
        errorMessage,
        errorDetails,
      });

      setTestResults((prev) =>
        prev.map((t) =>
          t.name === test.name
            ? {
                ...t,
                result: {
                  errorMessage,
                  errorDetails,
                },
                status: 'failure',
              }
            : t
        )
      );
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [testParams, setTestParams] = useState<
    Record<string, string | boolean | number | undefined>
  >({});

  const onTestItemPress = (item: TestItem) => {
    if (isRunning) return;
    setSelectedTest(item);
    setTestParams({ ...item.defaultParams });
    setModalVisible(true);
  };

  const handleParamChange = (
    key: string,
    value: string | boolean | number | undefined
  ) => {
    setTestParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunTest = async () => {
    if (selectedTest) {
      const testToRun = { ...selectedTest, defaultParams: testParams };
      await runSingleTest(testToRun);
    }
    setModalVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTest(null);
    setTestParams({});
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={testSections}
        renderItem={({ item: section }: { item: TestSection }) => (
          <>
            <SectionHeader title={section.title} />
            {section.tests.map((test: TestItem) => (
              <TestItem
                key={test.name}
                item={
                  testResults.find((r) => r.name === test.name) || {
                    name: test.name,
                    runOrder: test.runOrder,
                  }
                }
                onPress={() => onTestItemPress(test)}
              />
            ))}
          </>
        )}
        keyExtractor={(item) => item.title}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Run Test: {selectedTest?.name}</Text>
              {Object.entries(testParams).map(([key, value]) => (
                <View key={key} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{key}:</Text>
                  {typeof value === 'boolean' ? (
                    <Switch
                      value={value}
                      onValueChange={(newValue) =>
                        handleParamChange(key, newValue)
                      }
                    />
                  ) : typeof value === 'number' ? (
                    <TextInput
                      style={styles.input}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => {
                        const numValue = Number(text);
                        handleParamChange(
                          key,
                          isNaN(numValue) ? undefined : numValue
                        );
                      }}
                      keyboardType="numeric"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) =>
                        handleParamChange(key, text || undefined)
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                </View>
              ))}
              <Button title="Run" onPress={handleRunTest} />
              <Button title="Cancel" onPress={handleModalClose} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  runningTestItem: {
    backgroundColor: '#e6f3ff',
  },
  testItemContent: {
    flex: 1,
    marginRight: 10,
  },
  testItemTitle: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testItemStatus: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testItemResult: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
  },
  statusEmoji: {
    fontSize: 16,
    lineHeight: 24,
  },
  runTestsButton: {
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  sectionHeaderText: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontWeight: 'bold',
    fontSize: 24,
    paddingTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    width: 100,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
});

export default Tests;
