import { InboxAction } from '../models/InboxAction';

const mockClick = jest.fn(() => Promise.resolve());
const mockGetClient = jest.fn(() =>
  Promise.resolve({ inbox: { click: mockClick } })
);

jest.mock('../index', () => ({
  __esModule: true,
  default: {
    get shared() {
      return { getClient: mockGetClient };
    },
  },
}));

describe('InboxAction', () => {
  beforeEach(() => {
    mockClick.mockClear();
    mockGetClient.mockClear();
  });
  describe('constructor', () => {
    it('stores all fields', () => {
      const action = new InboxAction('Click me', 'https://example.com', {
        key: 'val',
      });
      expect(action.content).toBe('Click me');
      expect(action.href).toBe('https://example.com');
      expect(action.data).toEqual({ key: 'val' });
    });

    it('defaults every field to null', () => {
      const action = new InboxAction();
      expect(action.content).toBeNull();
      expect(action.href).toBeNull();
      expect(action.data).toBeNull();
    });
  });

  describe('fromJson', () => {
    it('parses a full JSON string', () => {
      const json = JSON.stringify({
        content: 'View',
        href: 'https://courier.com',
        data: { orderId: '123' },
      });
      const action = InboxAction.fromJson(json);
      expect(action.content).toBe('View');
      expect(action.href).toBe('https://courier.com');
      expect(action.data).toEqual({ orderId: '123' });
    });

    it('handles missing optional fields gracefully', () => {
      const action = InboxAction.fromJson('{}');
      expect(action.content).toBeNull();
      expect(action.href).toBeNull();
      expect(action.data).toBeNull();
    });

    it('throws on invalid JSON', () => {
      expect(() => InboxAction.fromJson('not json')).toThrow();
    });
  });
  describe('trackingId', () => {
    it('reads the id off data', () => {
      const action = new InboxAction('View', null, { trackingId: 'trk-1' });
      expect(action.trackingId).toBe('trk-1');
    });

    it('is undefined when the action carries no data', () => {
      expect(new InboxAction().trackingId).toBeUndefined();
    });

    it('is undefined for an empty or non-string id', () => {
      expect(
        new InboxAction('View', null, { trackingId: '' }).trackingId
      ).toBeUndefined();
      expect(
        new InboxAction('View', null, { trackingId: 7 }).trackingId
      ).toBeUndefined();
    });
  });

  describe('markAsClicked', () => {
    it('reports the click against the action id', async () => {
      const action = new InboxAction('View', null, { trackingId: 'trk-1' });
      await action.markAsClicked('msg-1');
      expect(mockClick).toHaveBeenCalledWith({
        messageId: 'msg-1',
        trackingId: 'trk-1',
      });
    });

    it('is a no-op when the action has no tracking id', async () => {
      await new InboxAction('View').markAsClicked('msg-1');
      expect(mockGetClient).not.toHaveBeenCalled();
      expect(mockClick).not.toHaveBeenCalled();
    });

    it('does not throw when no client is signed in', async () => {
      mockGetClient.mockResolvedValueOnce(null as any);
      const action = new InboxAction('View', null, { trackingId: 'trk-1' });
      await expect(action.markAsClicked('msg-1')).resolves.toBeUndefined();
    });
  });
});
