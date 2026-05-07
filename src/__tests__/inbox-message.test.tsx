jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => () => null),
    Client: { addClient: jest.fn(() => 'client-id'), removeClient: jest.fn() },
    Shared: {
      attachEmitter: jest.fn(() => Promise.resolve('emitter-id')),
      signIn: jest.fn(() => Promise.resolve()),
      readMessage: jest.fn(() => Promise.resolve()),
      unreadMessage: jest.fn(() => Promise.resolve()),
      archiveMessage: jest.fn(() => Promise.resolve()),
      openMessage: jest.fn(() => Promise.resolve()),
      clickMessage: jest.fn(() => Promise.resolve()),
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

import { InboxMessage } from '../models/InboxMessage';

describe('InboxMessage', () => {
  describe('constructor', () => {
    it('stores all provided fields', () => {
      const msg = new InboxMessage(
        'msg-1',
        'Title',
        'Body text',
        'Preview text',
        '2024-01-01T00:00:00Z',
        [],
        { foo: 'bar' },
        true,
        true,
        false,
        'Subtitle',
        '10:30 AM',
        { clickTrackingId: 'track-1' }
      );
      expect(msg.messageId).toBe('msg-1');
      expect(msg.title).toBe('Title');
      expect(msg.body).toBe('Body text');
      expect(msg.preview).toBe('Preview text');
      expect(msg.created).toBe('2024-01-01T00:00:00Z');
      expect(msg.actions).toEqual([]);
      expect(msg.data).toEqual({ foo: 'bar' });
      expect(msg.read).toBe(true);
      expect(msg.opened).toBe(true);
      expect(msg.archived).toBe(false);
      expect(msg.subtitle).toBe('Subtitle');
      expect(msg.time).toBe('10:30 AM');
      expect(msg.trackingIds).toEqual({ clickTrackingId: 'track-1' });
    });

    it('uses null/empty defaults for optional fields', () => {
      const msg = new InboxMessage('msg-2');
      expect(msg.title).toBeNull();
      expect(msg.body).toBeNull();
      expect(msg.preview).toBeNull();
      expect(msg.created).toBeNull();
      expect(msg.actions).toBeNull();
      expect(msg.data).toBeNull();
      expect(msg.read).toBeNull();
      expect(msg.opened).toBeNull();
      expect(msg.archived).toBeNull();
      expect(msg.subtitle).toBeNull();
      expect(msg.time).toBe('');
      expect(msg.trackingIds).toBeNull();
    });
  });

  describe('computed getters', () => {
    it('isRead is true when read is non-null', () => {
      expect(
        new InboxMessage('m', null, null, null, null, null, null, false).isRead
      ).toBe(true);
      expect(
        new InboxMessage('m', null, null, null, null, null, null, true).isRead
      ).toBe(true);
    });

    it('isRead is false when read is null', () => {
      expect(new InboxMessage('m').isRead).toBe(false);
    });

    it('isOpened is true when opened is non-null', () => {
      expect(
        new InboxMessage('m', null, null, null, null, null, null, null, false)
          .isOpened
      ).toBe(true);
    });

    it('isOpened is false when opened is null', () => {
      expect(new InboxMessage('m').isOpened).toBe(false);
    });

    it('isArchived is true when archived is non-null', () => {
      expect(
        new InboxMessage(
          'm',
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          true
        ).isArchived
      ).toBe(true);
    });

    it('isArchived is false when archived is null', () => {
      expect(new InboxMessage('m').isArchived).toBe(false);
    });
  });

  describe('fromJson', () => {
    it('parses a complete message', () => {
      const json = JSON.stringify({
        messageId: 'msg-abc',
        title: 'Welcome',
        body: 'Hello world',
        preview: 'Hello...',
        created: '2024-06-01',
        actions: [{ content: 'Open', href: 'https://example.com' }],
        data: { key: 'value' },
        read: '2024-06-01T12:00:00Z',
        opened: '2024-06-01T12:00:00Z',
        archived: null,
        subtitle: 'Sub',
        time: '3m ago',
        trackingIds: { openTrackingId: 'ot-1' },
      });

      const msg = InboxMessage.fromJson(json);
      expect(msg.messageId).toBe('msg-abc');
      expect(msg.title).toBe('Welcome');
      expect(msg.body).toBe('Hello world');
      expect(msg.data).toEqual({ key: 'value' });
    });

    it('handles a minimal message with only messageId', () => {
      const msg = InboxMessage.fromJson(JSON.stringify({ messageId: 'x' }));
      expect(msg.messageId).toBe('x');
    });

    it('throws on invalid JSON', () => {
      expect(() => InboxMessage.fromJson('{bad}')).toThrow();
    });
  });

  describe('action methods delegate to Courier.shared', () => {
    const { Modules } = require('../Modules');

    beforeEach(() => jest.clearAllMocks());

    it('markAsRead calls readMessage', async () => {
      const msg = new InboxMessage('m-1');
      await msg.markAsRead();
      expect(Modules.Shared.readMessage).toHaveBeenCalledWith('m-1');
    });

    it('markAsUnread calls unreadMessage', async () => {
      const msg = new InboxMessage('m-2');
      await msg.markAsUnread();
      expect(Modules.Shared.unreadMessage).toHaveBeenCalledWith('m-2');
    });

    it('markAsArchived calls archiveMessage', async () => {
      const msg = new InboxMessage('m-3');
      await msg.markAsArchived();
      expect(Modules.Shared.archiveMessage).toHaveBeenCalledWith('m-3');
    });

    it('markAsOpened calls openMessage', async () => {
      const msg = new InboxMessage('m-4');
      await msg.markAsOpened();
      expect(Modules.Shared.openMessage).toHaveBeenCalledWith('m-4');
    });

    it('markAsClicked calls clickMessage', async () => {
      const msg = new InboxMessage('m-5');
      await msg.markAsClicked();
      expect(Modules.Shared.clickMessage).toHaveBeenCalledWith('m-5');
    });
  });
});
