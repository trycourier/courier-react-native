import { InboxAction } from '../models/InboxAction';

describe('InboxAction', () => {
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
});
