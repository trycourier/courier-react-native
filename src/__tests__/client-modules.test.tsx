jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => () => null),
    Client: {
      addClient: jest.fn(() => 'cid-1'),
      removeClient: jest.fn(() => 'cid-1'),
      putUserToken: jest.fn(() => Promise.resolve()),
      deleteUserToken: jest.fn(() => Promise.resolve()),
      getMessages: jest.fn(() => Promise.resolve(JSON.stringify({ data: { messages: { nodes: [] } } }))),
      getArchivedMessages: jest.fn(() => Promise.resolve(JSON.stringify({ data: { messages: { nodes: [] } } }))),
      getMessageById: jest.fn(() => Promise.resolve(JSON.stringify({ data: { message: {} } }))),
      getUnreadMessageCount: jest.fn(() => Promise.resolve(5)),
      openMessage: jest.fn(() => Promise.resolve(200)),
      readMessage: jest.fn(() => Promise.resolve(200)),
      unreadMessage: jest.fn(() => Promise.resolve(200)),
      clickMessage: jest.fn(() => Promise.resolve(200)),
      archiveMessage: jest.fn(() => Promise.resolve(200)),
      readAllMessages: jest.fn(() => Promise.resolve(200)),
      getBrand: jest.fn(() => Promise.resolve(JSON.stringify({ data: { brand: {} } }))),
      getUserPreferences: jest.fn(() =>
        Promise.resolve(JSON.stringify({ items: [], paging: {} }))
      ),
      getUserPreferenceTopic: jest.fn(() =>
        Promise.resolve(
          JSON.stringify({
            default_status: 'OPTED_IN',
            has_custom_routing: false,
            custom_routing: [],
            status: 'OPTED_IN',
            topic_id: 't1',
            topic_name: 'Topic 1',
            section_name: 'Section',
            section_id: 's1',
          })
        )
      ),
      putUserPreferenceTopic: jest.fn(() => Promise.resolve()),
      postTrackingUrl: jest.fn(() => Promise.resolve()),
    },
    Shared: {
      attachEmitter: jest.fn(() => Promise.resolve('emitter-id')),
    },
    System: {
      setIOSForegroundPresentationOptions: jest.fn(() => 'ok'),
      registerPushNotificationClickedOnKilledState: jest.fn(),
    },
  },
}));

jest.mock('../Broadcaster', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => Promise.resolve(undefined)),
  }))
);

import { TokenClient } from '../client/TokenClient';
import { InboxClient } from '../client/InboxClient';
import { BrandClient } from '../client/BrandClient';
import { PreferenceClient } from '../client/PreferenceClient';
import { TrackingClient } from '../client/TrackingClient';
import { Modules } from '../Modules';

const mockClient = Modules.Client as any;

describe('TokenClient', () => {
  const tokens = new TokenClient('cid-1');

  beforeEach(() => jest.clearAllMocks());

  it('putUserToken forwards to native module', async () => {
    await tokens.putUserToken({ token: 'tok-1', provider: 'apn' });

    expect(mockClient.putUserToken).toHaveBeenCalledWith(
      'cid-1', 'tok-1', 'apn', undefined
    );
  });

  it('putUserToken passes device when provided', async () => {
    const device = { appId: 'com.test', adId: 'ad-1', deviceId: 'dev-1', platform: 'ios', token: 'tok-1' };
    await tokens.putUserToken({ token: 'tok-1', provider: 'apn', device });

    expect(mockClient.putUserToken).toHaveBeenCalledWith(
      'cid-1', 'tok-1', 'apn', device
    );
  });

  it('deleteUserToken forwards to native module', async () => {
    await tokens.deleteUserToken({ token: 'tok-1' });

    expect(mockClient.deleteUserToken).toHaveBeenCalledWith('cid-1', 'tok-1');
  });
});

describe('InboxClient', () => {
  const inbox = new InboxClient('cid-1');

  beforeEach(() => jest.clearAllMocks());

  it('getMessages uses default pagination limit of 24', async () => {
    await inbox.getMessages({});

    expect(mockClient.getMessages).toHaveBeenCalledWith('cid-1', 24, undefined);
  });

  it('getMessages passes custom pagination and cursor', async () => {
    await inbox.getMessages({ paginationLimit: 10, startCursor: 'abc' });

    expect(mockClient.getMessages).toHaveBeenCalledWith('cid-1', 10, 'abc');
  });

  it('getArchivedMessages uses default pagination limit', async () => {
    await inbox.getArchivedMessages({});

    expect(mockClient.getArchivedMessages).toHaveBeenCalledWith('cid-1', 24, undefined);
  });

  it('getMessageById forwards messageId', async () => {
    await inbox.getMessageById({ messageId: 'msg-99' });

    expect(mockClient.getMessageById).toHaveBeenCalledWith('cid-1', 'msg-99');
  });

  it('getUnreadMessageCount returns a number', async () => {
    const count = await inbox.getUnreadMessageCount();
    expect(count).toBe(5);
  });

  it('open forwards messageId', async () => {
    const result = await inbox.open({ messageId: 'msg-1' });
    expect(mockClient.openMessage).toHaveBeenCalledWith('cid-1', 'msg-1');
    expect(result).toBe(200);
  });

  it('read forwards messageId', async () => {
    await inbox.read({ messageId: 'msg-1' });
    expect(mockClient.readMessage).toHaveBeenCalledWith('cid-1', 'msg-1');
  });

  it('unread forwards messageId', async () => {
    await inbox.unread({ messageId: 'msg-1' });
    expect(mockClient.unreadMessage).toHaveBeenCalledWith('cid-1', 'msg-1');
  });

  it('click forwards messageId and trackingId', async () => {
    await inbox.click({ messageId: 'msg-1', trackingId: 'tid-1' });
    expect(mockClient.clickMessage).toHaveBeenCalledWith('cid-1', 'msg-1', 'tid-1');
  });

  it('archive forwards messageId', async () => {
    await inbox.archive({ messageId: 'msg-1' });
    expect(mockClient.archiveMessage).toHaveBeenCalledWith('cid-1', 'msg-1');
  });

  it('readAll calls readAllMessages', async () => {
    await inbox.readAll();
    expect(mockClient.readAllMessages).toHaveBeenCalledWith('cid-1');
  });
});

describe('BrandClient', () => {
  const brands = new BrandClient('cid-1');

  beforeEach(() => jest.clearAllMocks());

  it('getBrand forwards brandId and parses response', async () => {
    await brands.getBrand({ brandId: 'brand-1' });
    expect(mockClient.getBrand).toHaveBeenCalledWith('cid-1', 'brand-1');
  });
});

describe('PreferenceClient', () => {
  const preferences = new PreferenceClient('cid-1');

  beforeEach(() => jest.clearAllMocks());

  it('getUserPreferences calls without cursor by default', async () => {
    await preferences.getUserPreferences();
    expect(mockClient.getUserPreferences).toHaveBeenCalledWith('cid-1', undefined);
  });

  it('getUserPreferences passes pagination cursor', async () => {
    await preferences.getUserPreferences({ paginationCursor: 'cur-1' });
    expect(mockClient.getUserPreferences).toHaveBeenCalledWith('cid-1', 'cur-1');
  });

  it('getUserPreferenceTopic maps snake_case to camelCase', async () => {
    const topic = await preferences.getUserPreferenceTopic({ topicId: 't1' });

    expect(mockClient.getUserPreferenceTopic).toHaveBeenCalledWith('cid-1', 't1');
    expect(topic.topicId).toBe('t1');
    expect(topic.topicName).toBe('Topic 1');
    expect(topic.defaultStatus).toBe('OPTED_IN');
    expect(topic.hasCustomRouting).toBe(false);
    expect(topic.customRouting).toEqual([]);
  });

  it('putUserPreferenceTopic forwards all args', async () => {
    await preferences.putUserPreferenceTopic({
      topicId: 't1',
      status: 'OPTED_OUT' as any,
      hasCustomRouting: true,
      customRouting: ['email' as any, 'push' as any],
    });

    expect(mockClient.putUserPreferenceTopic).toHaveBeenCalledWith(
      'cid-1', 't1', 'OPTED_OUT', true, ['email', 'push']
    );
  });
});

describe('TrackingClient', () => {
  const tracking = new TrackingClient('cid-1');

  beforeEach(() => jest.clearAllMocks());

  it('postTrackingUrl forwards url and event', async () => {
    await tracking.postTrackingUrl({ url: 'https://t.co/track', event: 'DELIVERED' as any });

    expect(mockClient.postTrackingUrl).toHaveBeenCalledWith(
      'cid-1', 'https://t.co/track', 'DELIVERED'
    );
  });
});
