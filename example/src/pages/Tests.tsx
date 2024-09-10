import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, FlatList, TouchableOpacity, TextInput, Modal, Button, Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Courier, { CourierClient, CourierTrackingEvent, CourierUserPreferencesChannel, CourierUserPreferencesStatus, iOSForegroundPresentationOptions } from '@trycourier/courier-react-native';
import Env from '../Env';
import { ExampleServer, Utils } from '../Utils';

let savedClient: CourierClient | undefined = undefined;

const IntegrationTests: Record<string, (params: any) => Promise<any>> = {
  
  createClient: async (params: { userId: string, clientKey: string, jwt?: string, showLogs: boolean, tenantId?: string, connectionId?: string }) => {
    
    const token = params.jwt ?? await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: params.userId,
    });

    savedClient = new CourierClient({
      userId: params.userId,
      showLogs: params.showLogs,
      jwt: token,
      clientKey: params.clientKey,
      tenantId: params.tenantId,
      connectionId: params.connectionId,
    });

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

  testPutToken: async (params: { token: string, provider: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    await savedClient.tokens.putUserToken({
      provider: params.provider,
      token: params.token,
    });
    return { token: params.token, provider: params.provider };
  },

  testDeleteToken: async (params: { token: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    await savedClient.tokens.deleteUserToken({ token: params.token });
  },

  testGetBrands: async (params: { brandId: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    const brand = await savedClient.brands.getBrand({ brandId: params.brandId });
    return brand;
  },

  testMessages: async (params: { paginationLimit: number, startCursor?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    return await savedClient.inbox.getMessages({
      paginationLimit: params.paginationLimit,
      startCursor: params.startCursor,
    });
  },

  testUnreadCount: async () => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    const count = await savedClient.inbox.getUnreadMessageCount();
    console.log('Unread Count:', count);
    return count;
  },

  testArchivedMessages: async (params: { paginationLimit: number, startCursor?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    return await savedClient.inbox.getArchivedMessages({
      paginationLimit: params.paginationLimit,
      startCursor: params.startCursor,
    });
  },

  testMessageById: async (params: { messageId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    return await savedClient.inbox.getMessageById({
      messageId: messageId,
    });
  },

  openMessage: async (params: { messageId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    await savedClient.inbox.open({
      messageId: messageId,
    });

    return { messageId: messageId };

  },

  clickMessage: async (params: { messageId?: string, trackingId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    await savedClient.inbox.click({
      messageId: messageId,
      trackingId: params.trackingId ?? 'test-tracking-id',
    });

    return { messageId: messageId };

  },

  readMessage: async (params: { messageId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    await savedClient.inbox.read({
      messageId: messageId,
    });

    return { messageId: messageId };
  },

  unreadMessage: async (params: { messageId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    await savedClient.inbox.unread({
      messageId: messageId,
    });

    return { messageId: messageId };

  },

  archiveMessage: async (params: { messageId?: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }

    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: savedClient!.options.userId,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });

    await savedClient.inbox.archive({
      messageId: messageId,
    });

    return { messageId: messageId };

  },

  readAllMessages: async () => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    await savedClient.inbox.readAll();
  },

  testGetPreferences: async () => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    return await savedClient.preferences.getUserPreferences();
  },

  testUpdatePreferences: async (params: { topicId: string, status: string, hasCustomRouting: boolean, customRouting: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    await savedClient.preferences.putUserPreferenceTopic({
      topicId: params.topicId,
      status: params.status as CourierUserPreferencesStatus,
      hasCustomRouting: params.hasCustomRouting,
      customRouting: params.customRouting.split(',').map(channel => channel.trim() as CourierUserPreferencesChannel),
    });
  },

  testGetPreferenceTopics: async (params: { topicId: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    return await savedClient.preferences.getUserPreferenceTopic({ topicId: params.topicId });
  },

  testPostTrackingUrl: async (params: { trackingUrl: string, event: string }) => {
    if (!savedClient) {
      throw new Error("Client not initialized. Run createClient first.");
    }
    return await savedClient.tracking.postTrackingUrl({
      url: params.trackingUrl,
      event: params.event as CourierTrackingEvent,
    });
  },

  testSignIn: async (params: { userId: string, accessToken?: string, clientKey: string, tenantId: string, showLogs: boolean }) => {

    const token = params.accessToken ?? await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: params.userId,
    });

    await Courier.shared.signIn({
      userId: params.userId,
      accessToken: token,
      clientKey: params.clientKey,
      tenantId: params.tenantId,
      showLogs: params.showLogs,
    });
    return Courier.shared.client?.options;
  },

  testGetUserId: async () => {
    return Courier.shared.userId;
  },

  testGetTenantId: async () => {
    return Courier.shared.tenantId;
  },

  testGetIsUserSignedIn: async () => {
    return Courier.shared.isUserSignedIn;
  },

  testAuthenticationListener: async () => {
    const listener = Courier.shared.addAuthenticationListener({
      onUserChanged: (userId) => {
        console.log('User changed:', userId);
      },
    });
    listener.remove();
    return listener.listenerId;
  },

  testRemoveAllAuthenticationListeners: async () => {
    return Courier.shared.removeAllAuthenticationListeners();
  },

  testSignOut: async () => {
    await Courier.shared.signOut();
  },

  testGetClient: async () => {
    const client = Courier.shared.client;
    return {
      clientId: client?.clientId,
      options: client?.options,
    };
  },

  testGetAllTokens: async () => {
    const tokens = await Courier.shared.getAllTokens();
    const tokenObject: Record<string, string> = {};
    tokens.forEach((value, key) => {
      tokenObject[key] = value;
    });
    return tokenObject
  },

  testGetToken: async (params: { provider: string }) => {
    return await Courier.shared.getToken({ key: params.provider });
  },

  testSetToken: async (params: { provider: string, token: string }) => {
    return await Courier.shared.setToken({ key: params.provider, token: params.token });
  },

  testAddPushNotificationListener: async () => {
    const listener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked: (push) => {
        console.log('Push notification clicked:', push);
      },
    });
    listener.remove();
    return listener.listenerId;
  },

  testRemoveAllPushNotificationListeners: async () => {
    return Courier.shared.removeAllPushNotificationListeners();
  },

  testSetInboxPaginationLimit: async (params: { limit: number }) => {
    Courier.shared.inboxPaginationLimit = params.limit;
  },

  testGetInboxPaginationLimit: async () => {
    return Courier.shared.inboxPaginationLimit;
  },

  testOpenMessage: async (params: { messageId?: string }) => {
    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: Courier.shared.userId!,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });
    await Courier.shared.openMessage({ messageId: messageId });
    return { messageId: messageId };
  },

  testClickMessage: async (params: { messageId?: string }) => {
    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: Courier.shared.userId!,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });
    await Courier.shared.clickMessage({ messageId: messageId });
    return { messageId: messageId };
  },
  
  testReadMessage: async (params: { messageId?: string }) => {
    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: Courier.shared.userId!,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });
    await Courier.shared.readMessage({ messageId: messageId });
    return { messageId: messageId };
  },

  testUnreadMessage: async (params: { messageId?: string }) => {
    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: Courier.shared.userId!,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });
    await Courier.shared.unreadMessage({ messageId: messageId });
    return { messageId: messageId };
  },
  
  testArchiveMessage: async (params: { messageId?: string }) => {
    const messageId = params.messageId ?? await new Promise<string>(async (resolve) => {
      const result = await ExampleServer.sendTest({
        authKey: Env.authKey,
        userId: Courier.shared.userId!,
        channel: 'inbox',
      });
      setTimeout(() => resolve(result), 5000);
    });
    await Courier.shared.archiveMessage({ messageId: messageId });
    return { messageId: messageId };
  },

  testReadAllInboxMessages: async () => {
    return await Courier.shared.readAllInboxMessages();
  },

  testAddInboxListener: async () => {
    const listener = Courier.shared.addInboxListener({
      onInitialLoad: () => {
        console.log('Inbox initial load');
      },
      onError: (error) => {
        console.log('Inbox error:', error);
      },
      onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
        console.log('Inbox messages changed:', messages, unreadMessageCount, totalMessageCount, canPaginate);
      },
    });
    listener.remove();
    return listener;
  },

  testRemoveAllInboxListeners: async () => {
    return Courier.shared.removeAllInboxListeners();
  },

  testRefreshInbox: async () => {
    return await Courier.shared.refreshInbox();
  },

  testFetchNextPageOfMessages: async () => {
    return await Courier.shared.fetchNextPageOfMessages();
  },

  testRequestPushNotificationPermission: async () => {
    return await Courier.requestNotificationPermission();
  },

  testGetPushNotificationPermissionStatus: async () => {
    return await Courier.getNotificationPermissionStatus();
  },

  testSetIOSForegroundPresentationOptions: async (params: { options: iOSForegroundPresentationOptions[] }) => {
    return Courier.setIOSForegroundPresentationOptions({ options: params.options });
  },

  testOpenSettingsForApp: async () => {
    return Courier.openSettingsForApp();
  },

  testSendInboxMessage: async (params: { userId: string, title?: string, body?: string }) => {
    const messageId = await ExampleServer.sendTest({
      authKey: Env.authKey,
      userId: params.userId,
      channel: 'inbox',
      title: params.title ?? 'Test',
      body: params.body ?? 'Body',
    });
    return { messageId: messageId };
  },

  testSendApnMessage: async (params: { userId: string, title?: string, body?: string }) => {
    const messageId = await ExampleServer.sendTest({
      authKey: Env.authKey,
      userId: params.userId,
      channel: 'apn',
      title: params.title ?? 'Test',
      body: params.body ?? 'Body',
    });
    return { messageId: messageId };
  },

  testSendFcmMessage: async (params: { userId: string, title?: string, body?: string }) => {
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

const getTestSections = (): TestSection[] => [
  {
    title: 'Client Management',
    tests: [
      {
        name: 'Create Client',
        testId: 'createClient',
        defaultParams: { userId: Utils.generateUUID(), clientKey: Env.clientKey, showLogs: true, tenantId: undefined, connectionId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Remove Client',
        testId: 'removeClient',
        defaultParams: { clientId: savedClient?.clientId },
        runOrder: 'skip'
      },
    ]
  },
  {
    title: 'Tokens',
    tests: [
      {
        name: 'Put Token',
        testId: 'testPutToken',
        defaultParams: { token: 'test-token', provider: 'test-provider' },
        runOrder: 'normal'
      },
      {
        name: 'Delete Token',
        testId: 'testDeleteToken',
        defaultParams: { token: 'test-token' },
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Brands',
    tests: [
      {
        name: 'Get Brand',
        testId: 'testGetBrands',
        defaultParams: { brandId: Env.brandId },
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Inbox',
    tests: [
      {
        name: 'Get Messages',
        testId: 'testMessages',
        defaultParams: { paginationLimit: 10, paginationCursor: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Get Unread Count',
        testId: 'testUnreadCount',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Get Archived Messages',
        testId: 'testArchivedMessages',
        defaultParams: { paginationLimit: 10, paginationCursor: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Get Message By ID',
        testId: 'testMessageById',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Open Message',
        testId: 'openMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Click Message',
        testId: 'clickMessage',
        defaultParams: { messageId: undefined, trackingId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Read Message',
        testId: 'readMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Unread Message',
        testId: 'unreadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Archive Message',
        testId: 'archiveMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Read All Messages',
        testId: 'readAllMessages',
        defaultParams: {},
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Preferences',
    tests: [
      {
        name: 'Get Preferences',
        testId: 'testGetPreferences',
        defaultParams: { paginationCursor: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Update Preferences',
        testId: 'testUpdatePreferences',
        defaultParams: { topicId: Env.topicId, status: 'OPTED_IN', hasCustomRouting: true, customRouting: 'push,sms,email' },
        runOrder: 'normal'
      },
      {
        name: 'Get Preference Topics',
        testId: 'testGetPreferenceTopics',
        defaultParams: { topicId: Env.topicId },
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Tracking',
    tests: [
      {
        name: 'Post Tracking Url',
        testId: 'testPostTrackingUrl',
        defaultParams: { trackingUrl: 'https://af6303be-0e1e-40b5-bb80-e1d9299cccff.ct0.app/t/tzgspbr4jcmcy1qkhw96m0034bvy', event: 'delivered' },
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Shared Authentication',
    tests: [
      {
        name: 'Sign In',
        testId: 'testSignIn',
        defaultParams: { userId: Utils.generateUUID(), accessToken: undefined, clientKey: Env.clientKey, tenantId: undefined, showLogs: true },
        runOrder: 'normal'
      },
      {
        name: 'Get User ID',
        testId: 'testGetUserId',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Get Tenant ID',
        testId: 'testGetTenantId',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Get Is User Signed In',
        testId: 'testGetIsUserSignedIn',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Add Authentication Listener',
        testId: 'testAuthenticationListener',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Remove All Authentication Listeners',
        testId: 'testRemoveAllAuthenticationListeners',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Sign Out',
        testId: 'testSignOut',
        defaultParams: {},
        runOrder: 'skip'
      }
    ]
  },
  {
    title: 'Shared Client',
    tests: [
      {
        name: 'Get Client',
        testId: 'testGetClient',
        defaultParams: {},
        runOrder: 'normal'
      }
    ]
  },
  {
    title: 'Shared Push',
    tests: [
      {
        name: 'Set Token',
        testId: 'testSetToken',
        defaultParams: { provider: 'expo', token: 'test-token' },
        runOrder: 'normal'
      },
      {
        name: 'Get Token',
        testId: 'testGetToken',
        defaultParams: { provider: 'expo' },
        runOrder: 'normal'
      },
      {
        name: 'Get All Tokens',
        testId: 'testGetAllTokens',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Add Push Notification Listener',
        testId: 'testAddPushNotificationListener',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Remove All Push Notification Listeners',
        testId: 'testRemoveAllPushNotificationListeners',
        defaultParams: {},
        runOrder: 'skip'
      }
    ]
  },
  {
    title: 'Shared Inbox',
    tests: [
      {
        name: 'Set Inbox Pagination Limit',
        testId: 'testSetInboxPaginationLimit',
        defaultParams: { limit: 20 },
        runOrder: 'normal'
      },
      {
        name: 'Get Inbox Pagination Limit',
        testId: 'testGetInboxPaginationLimit',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Open Message',
        testId: 'testOpenMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Click Message',
        testId: 'testClickMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Read Message',
        testId: 'testReadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Unread Message',
        testId: 'testUnreadMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Archive Message',
        testId: 'testArchiveMessage',
        defaultParams: { messageId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'Read All Inbox Messages',
        testId: 'testReadAllInboxMessages',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Add Inbox Listener',
        testId: 'testAddInboxListener',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Remove All Inbox Listeners',
        testId: 'testRemoveAllInboxListeners',
        defaultParams: {},
        runOrder: 'skip'
      },
      {
        name: 'Refresh Inbox',
        testId: 'testRefreshInbox',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Fetch Next Page of Messages',
        testId: 'testFetchNextPageOfMessages',
        defaultParams: {},
        runOrder: 'normal'
      }
    ]
  },
  {
    title: 'System',
    tests: [
      {
        name: 'Request Push Notification Permission',
        testId: 'testRequestPushNotificationPermission',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Get Push Notification Permission Status',
        testId: 'testGetPushNotificationPermissionStatus',
        defaultParams: {},
        runOrder: 'normal'
      },
      {
        name: 'Set iOS Foreground Presentation Options',
        testId: 'testSetIOSForegroundPresentationOptions',
        defaultParams: { options: 'badge,sound,list,banner' },
        runOrder: 'normal'
      },
      {
        name: 'Open Settings for App',
        testId: 'testOpenSettingsForApp',
        defaultParams: {},
        runOrder: 'normal'
      },
    ]
  },
  {
    title: 'Send',
    tests: [
      {
        name: 'Send Inbox Message',
        testId: 'testSendInboxMessage',
        defaultParams: { 
          userId: Courier.shared.userId ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body'
        },
        runOrder: 'normal'
      },
      {
        name: 'Send APN Message',
        testId: 'testSendApnMessage',
        defaultParams: { 
          userId: Courier.shared.userId ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body'
        },
        runOrder: 'normal'
      },
      {
        name: 'Send FCM Message',
        testId: 'testSendFcmMessage',
        defaultParams: { 
          userId: Courier.shared.userId ?? savedClient?.options.userId,
          title: 'Test',
          body: 'Body'
        },
        runOrder: 'normal'
      }
    ]
  }
];

const TestItem = ({ item, onPress }: { item: { name: string; result?: unknown; status?: string; runOrder?: string }, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.testItem, item.status === 'running' && styles.runningTestItem]}>
      <View style={styles.testItemContent}>
        <Text style={styles.testItemTitle}>{item.name}</Text>
        {item.status !== undefined && item.status !== 'running' && (
          <Text style={styles.testItemResult}>
            {item.result !== undefined ? (
              typeof item.result === 'number' ? 
                item.result.toString() : 
                JSON.stringify(item.result, null, 2)
            ) : 'No Response'}
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
          <Text style={styles.statusEmoji}>{item.status === 'success' ? '✅' : '❌'}</Text>
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
  const testSections = getTestSections();
  const [testResults, setTestResults] = useState<Array<{ name: string; result?: unknown; status?: string; runOrder?: string }>>(
    testSections.flatMap(section => section.tests.map(test => ({ name: test.name, runOrder: test.runOrder })))
  );
  const [isRunning, setIsRunning] = useState(false);

  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const totalTests = testSections.flatMap(section => section.tests).length;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={runAllTests} disabled={isRunning} style={{ marginRight: 22 }}>
          {isRunning ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={[styles.runTestsButton, isRunning && styles.disabledButton]}>Run Tests</Text>
          )}
        </TouchableOpacity>
      ),
      headerTitle: isRunning ? `Running Test ${currentTestIndex + 1}/${totalTests}` : 'Tests',
    });
  }, [isRunning, currentTestIndex]);

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

    setTestResults(prev => prev.map(item => ({
      ...item,
      status: undefined,
      result: undefined
    })));

    setIsRunning(true);
    setCurrentTestIndex(0);
    const normalTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'normal'));
    const endTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'run at end'));
    const skipTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'skip'));
    
    for (let i = 0; i < normalTests.length; i++) {
      setCurrentTestIndex(i);
      await runSingleTest(normalTests[i]!);
    }
    
    for (let i = 0; i < endTests.length; i++) {
      setCurrentTestIndex(normalTests.length + i);
      await runSingleTest(endTests[i]!);
    }

    for (const test of skipTests) {
      setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, status: 'skipped' } : t));
    }
    
    setIsRunning(false);
    setCurrentTestIndex(0);
  };

  const runSingleTest = async (test: TestItem) => {
    setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, status: 'running', result: undefined } : t));
    setModalVisible(false);  // Close the modal when the test starts
    try {
      const testFunction = IntegrationTests[test.testId];
      if (typeof testFunction === 'function') {
        const result = await testFunction(test.defaultParams);
        setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, result, status: 'success' } : t));
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

      setTestResults(prev => prev.map(t => 
        t.name === test.name 
          ? { 
              ...t, 
              result: {
                errorMessage,
                errorDetails,
              },
              status: 'failure' 
            } 
          : t
      ));
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string | boolean | number | undefined>>({});

  const onTestItemPress = (item: TestItem) => {
    if (isRunning) return;
    setSelectedTest(item);
    setTestParams({ ...item.defaultParams });
    setModalVisible(true);
  };

  const handleParamChange = (key: string, value: string | boolean | number | undefined) => {
    setTestParams(prev => ({ ...prev, [key]: value }));
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
        renderItem={({ item: section }) => (
          <>
            <SectionHeader title={section.title} />
            {section.tests.map((test) => (
              <TestItem
                key={test.name}
                item={testResults.find(r => r.name === test.name) || { name: test.name, runOrder: test.runOrder }}
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
                      onValueChange={(newValue) => handleParamChange(key, newValue)}
                    />
                  ) : typeof value === 'number' ? (
                    <TextInput
                      style={styles.input}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => {
                        const numValue = Number(text);
                        handleParamChange(key, isNaN(numValue) ? undefined : numValue);
                      }}
                      keyboardType="numeric"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => handleParamChange(key, text || undefined)}
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
