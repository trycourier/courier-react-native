jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => () => null),
    Client: {
      addClient: jest.fn(() => 'client-id'),
      removeClient: jest.fn(() => 'client-id'),
    },
    Shared: {
      attachEmitter: jest.fn(() => Promise.resolve('emitter-id')),
      signIn: jest.fn(() => Promise.resolve()),
      signOut: jest.fn(() => Promise.resolve()),
      getUserId: jest.fn(() => Promise.resolve('user-1')),
      getTenantId: jest.fn(() => Promise.resolve('tenant-1')),
      getIsUserSignedIn: jest.fn(() => Promise.resolve('true')),
      getClient: jest.fn(() => Promise.resolve(null)),
      getAllTokens: jest.fn(() =>
        Promise.resolve({ apn: 'tok-apn', fcm: 'tok-fcm' })
      ),
      getToken: jest.fn(() => Promise.resolve('tok-abc')),
      setToken: jest.fn(() => Promise.resolve()),
      getInboxPaginationLimit: jest.fn(() => Promise.resolve(32)),
      setInboxPaginationLimit: jest.fn(() => Promise.resolve()),
      openMessage: jest.fn(() => Promise.resolve()),
      clickMessage: jest.fn(() => Promise.resolve()),
      readMessage: jest.fn(() => Promise.resolve()),
      unreadMessage: jest.fn(() => Promise.resolve()),
      archiveMessage: jest.fn(() => Promise.resolve()),
      readAllInboxMessages: jest.fn(() => Promise.resolve()),
      refreshInbox: jest.fn(() => Promise.resolve()),
      fetchNextPageOfMessages: jest.fn(() => Promise.resolve(null)),
      addAuthenticationListener: jest.fn(() =>
        Promise.resolve('auth-listener-1')
      ),
      removeAuthenticationListener: jest.fn(() => Promise.resolve()),
      removeAllAuthenticationListeners: jest.fn(() => Promise.resolve()),
      addInboxListener: jest.fn(() => Promise.resolve('inbox-listener-1')),
      removeInboxListener: jest.fn(() => Promise.resolve()),
      removeAllInboxListeners: jest.fn(() => Promise.resolve()),
      setIsUITestsActive: jest.fn(),
    },
    System: {
      setIOSForegroundPresentationOptions: jest.fn(() => 'ok'),
      getNotificationPermissionStatus: jest.fn(() =>
        Promise.resolve('authorized')
      ),
      requestNotificationPermission: jest.fn(() => Promise.resolve('granted')),
      openSettingsForApp: jest.fn(),
      registerPushNotificationClickedOnKilledState: jest.fn(),
    },
  },
}));

jest.mock('../Broadcaster', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  }))
);

import Courier from '../index';
import { Modules } from '../Modules';

const mockShared = Modules.Shared as any;
const mockSystem = Modules.System as any;

describe('Courier singleton', () => {
  it('returns the same instance via Courier.shared', () => {
    expect(Courier.shared).toBe(Courier.shared);
  });
});

describe('Authentication', () => {
  beforeEach(() => jest.clearAllMocks());

  it('signIn forwards credentials to Modules.Shared.signIn', async () => {
    await Courier.shared.signIn({
      accessToken: 'jwt-tok',
      clientKey: 'ck',
      userId: 'u1',
      tenantId: 't1',
    });

    expect(mockShared.signIn).toHaveBeenCalledWith(
      'jwt-tok',
      'ck',
      'u1',
      't1',
      null,
      expect.any(Boolean)
    );
  });

  it('signIn passes apiUrls when provided', async () => {
    const urls = {
      rest: 'r',
      graphql: 'g',
      inboxGraphql: 'ig',
      inboxWebSocket: 'ws',
    };
    await Courier.shared.signIn({
      accessToken: 'jwt',
      userId: 'u1',
      apiUrls: urls,
    });

    expect(mockShared.signIn).toHaveBeenCalledWith(
      'jwt',
      undefined,
      'u1',
      undefined,
      urls,
      expect.any(Boolean)
    );
  });

  it('signOut delegates to native module', async () => {
    await Courier.shared.signOut();
    expect(mockShared.signOut).toHaveBeenCalled();
  });

  it('getUserId returns the user id', async () => {
    const id = await Courier.shared.getUserId();
    expect(id).toBe('user-1');
  });

  it('getUserId returns undefined when native returns null', async () => {
    mockShared.getUserId.mockResolvedValueOnce(null);
    const id = await Courier.shared.getUserId();
    expect(id).toBeUndefined();
  });

  it('getTenantId returns the tenant id', async () => {
    const id = await Courier.shared.getTenantId();
    expect(id).toBe('tenant-1');
  });

  it('isUserSignedIn returns true when native says "true"', async () => {
    expect(await Courier.shared.isUserSignedIn()).toBe(true);
  });

  it('isUserSignedIn returns false when native says "false"', async () => {
    mockShared.getIsUserSignedIn.mockResolvedValueOnce('false');
    expect(await Courier.shared.isUserSignedIn()).toBe(false);
  });

  it('isUserSignedIn handles null as false', async () => {
    mockShared.getIsUserSignedIn.mockResolvedValueOnce(null);
    expect(await Courier.shared.isUserSignedIn()).toBe(false);
  });

  it('isUserSignedIn handles case insensitive "TRUE"', async () => {
    mockShared.getIsUserSignedIn.mockResolvedValueOnce('TRUE');
    expect(await Courier.shared.isUserSignedIn()).toBe(true);
  });
});

describe('Authentication listeners', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addAuthenticationListener registers a listener', async () => {
    const listener = await Courier.shared.addAuthenticationListener({
      onUserChanged: jest.fn(),
    });

    expect(listener.listenerId).toBeTruthy();
    expect(mockShared.addAuthenticationListener).toHaveBeenCalled();
  });

  it('removeAuthenticationListener calls native remove', async () => {
    const listener = await Courier.shared.addAuthenticationListener({
      onUserChanged: jest.fn(),
    });

    const id = await Courier.shared.removeAuthenticationListener({
      listenerId: listener.listenerId,
    });

    expect(id).toBe(listener.listenerId);
    expect(mockShared.removeAuthenticationListener).toHaveBeenCalledWith(
      listener.listenerId
    );
  });

  it('removeAllAuthenticationListeners clears all listeners', async () => {
    await Courier.shared.addAuthenticationListener({
      onUserChanged: jest.fn(),
    });
    await Courier.shared.removeAllAuthenticationListeners();

    expect(mockShared.removeAllAuthenticationListeners).toHaveBeenCalled();
  });
});

describe('Push tokens', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAllTokens returns a Map', async () => {
    const tokens = await Courier.shared.getAllTokens();
    expect(tokens).toBeInstanceOf(Map);
    expect(tokens.get('apn')).toBe('tok-apn');
    expect(tokens.get('fcm')).toBe('tok-fcm');
    expect(tokens.size).toBe(2);
  });

  it('getToken forwards key to native', async () => {
    const token = await Courier.shared.getToken({ key: 'apn' });
    expect(mockShared.getToken).toHaveBeenCalledWith('apn');
    expect(token).toBe('tok-abc');
  });

  it('getTokenForProvider forwards provider string', async () => {
    await Courier.shared.getTokenForProvider({ provider: 'apn' as any });
    expect(mockShared.getToken).toHaveBeenCalledWith('apn');
  });

  it('setToken forwards key and token', async () => {
    await Courier.shared.setToken({ key: 'apn', token: 'new-tok' });
    expect(mockShared.setToken).toHaveBeenCalledWith('apn', 'new-tok');
  });

  it('setTokenForProvider forwards provider and token', async () => {
    await Courier.shared.setTokenForProvider({
      provider: 'firebase-fcm' as any,
      token: 'fcm-tok',
    });
    expect(mockShared.setToken).toHaveBeenCalledWith('firebase-fcm', 'fcm-tok');
  });
});

describe('Push notification listeners', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addPushNotificationListener returns a listener with an id', () => {
    const listener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked: jest.fn(),
    });

    expect(listener.listenerId).toMatch(/^push_/);
    expect(
      mockSystem.registerPushNotificationClickedOnKilledState
    ).toHaveBeenCalled();
  });

  it('removePushNotificationListener removes the listener', async () => {
    const listener = Courier.shared.addPushNotificationListener({});
    const id = await Courier.shared.removePushNotificationListener({
      listenerId: listener.listenerId,
    });

    expect(id).toBe(listener.listenerId);
  });

  it('removeAllPushNotificationListeners clears callbacks', async () => {
    const onClick = jest.fn();
    const listener = Courier.shared.addPushNotificationListener({
      onPushNotificationClicked: onClick,
    });

    await Courier.shared.removeAllPushNotificationListeners();

    expect(listener.onPushNotificationClicked).toBeUndefined();
    expect(listener.onPushNotificationDelivered).toBeUndefined();
  });
});

describe('Inbox shared methods', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getInboxPaginationLimit returns number', async () => {
    const limit = await Courier.shared.getInboxPaginationLimit();
    expect(limit).toBe(32);
  });

  it('setInboxPaginationLimit delegates to native', async () => {
    await Courier.shared.setInboxPaginationLimit(50);
    expect(mockShared.setInboxPaginationLimit).toHaveBeenCalledWith(50);
  });

  it('openMessage delegates messageId', async () => {
    await Courier.shared.openMessage({ messageId: 'msg-1' });
    expect(mockShared.openMessage).toHaveBeenCalledWith('msg-1');
  });

  it('clickMessage delegates messageId', async () => {
    await Courier.shared.clickMessage({ messageId: 'msg-1' });
    expect(mockShared.clickMessage).toHaveBeenCalledWith('msg-1');
  });

  it('readMessage delegates messageId', async () => {
    await Courier.shared.readMessage({ messageId: 'msg-1' });
    expect(mockShared.readMessage).toHaveBeenCalledWith('msg-1');
  });

  it('unreadMessage delegates messageId', async () => {
    await Courier.shared.unreadMessage({ messageId: 'msg-1' });
    expect(mockShared.unreadMessage).toHaveBeenCalledWith('msg-1');
  });

  it('archiveMessage delegates messageId', async () => {
    await Courier.shared.archiveMessage({ messageId: 'msg-1' });
    expect(mockShared.archiveMessage).toHaveBeenCalledWith('msg-1');
  });

  it('readAllInboxMessages delegates to native', async () => {
    await Courier.shared.readAllInboxMessages();
    expect(mockShared.readAllInboxMessages).toHaveBeenCalled();
  });

  it('refreshInbox delegates to native', async () => {
    await Courier.shared.refreshInbox();
    expect(mockShared.refreshInbox).toHaveBeenCalled();
  });

  it('fetchNextPageOfMessages returns empty array when native returns null', async () => {
    const msgs = await Courier.shared.fetchNextPageOfMessages({
      inboxMessageFeed: 'feed' as any,
    });
    expect(msgs).toEqual([]);
  });

  it('fetchNextPageOfMessages parses messages from JSON', async () => {
    mockShared.fetchNextPageOfMessages.mockResolvedValueOnce(
      JSON.stringify({ messages: [{ messageId: 'msg-1' }] })
    );

    const msgs = await Courier.shared.fetchNextPageOfMessages({
      inboxMessageFeed: 'feed' as any,
    });
    expect(msgs).toEqual([{ messageId: 'msg-1' }]);
  });
});

describe('Inbox listeners', () => {
  beforeEach(() => jest.clearAllMocks());

  it('addInboxListener registers and returns a listener', async () => {
    const listener = await Courier.shared.addInboxListener({
      onLoading: jest.fn(),
      onError: jest.fn(),
    });

    expect(listener.listenerId).toMatch(/^inbox_/);
    expect(mockShared.addInboxListener).toHaveBeenCalled();
  });

  it('removeInboxListener calls native and cleans up', async () => {
    const listener = await Courier.shared.addInboxListener({});
    const id = await Courier.shared.removeInboxListener({
      listenerId: listener.listenerId,
    });

    expect(id).toBe(listener.listenerId);
    expect(mockShared.removeInboxListener).toHaveBeenCalledWith(
      listener.listenerId
    );
  });

  it('removeAllInboxListeners clears all inbox listeners', async () => {
    await Courier.shared.addInboxListener({});
    await Courier.shared.removeAllInboxListeners();

    expect(mockShared.removeAllInboxListeners).toHaveBeenCalled();
  });
});

describe('getClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns undefined when native returns null', async () => {
    mockShared.getClient.mockResolvedValueOnce(null);
    const client = await Courier.shared.getClient();
    expect(client).toBeUndefined();
  });

  it('returns a CourierClient when native returns JSON', async () => {
    mockShared.getClient.mockResolvedValueOnce(
      JSON.stringify({ userId: 'u1', showLogs: false })
    );

    const client = await Courier.shared.getClient();
    expect(client).toBeDefined();
    expect(client!.options.userId).toBe('u1');
  });
});

describe('Static system methods', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getNotificationPermissionStatus delegates to native', async () => {
    const status = await Courier.getNotificationPermissionStatus();
    expect(status).toBe('authorized');
  });

  it('requestNotificationPermission delegates to native', async () => {
    const result = await Courier.requestNotificationPermission();
    expect(result).toBe('granted');
  });

  it('openSettingsForApp delegates to native', () => {
    Courier.openSettingsForApp();
    expect(mockSystem.openSettingsForApp).toHaveBeenCalled();
  });
});
