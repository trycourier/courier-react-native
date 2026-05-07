import { CourierUtils, Events } from '../utils';

describe('Events namespace', () => {
  it('exposes push event keys', () => {
    expect(Events.Push.CLICKED).toBe('pushNotificationClicked');
    expect(Events.Push.DELIVERED).toBe('pushNotificationDelivered');
  });

  it('exposes log event key', () => {
    expect(Events.Log.DEBUG_LOG).toBe('courierDebugEvent');
  });
});

describe('CourierUtils', () => {
  describe('generateUUID', () => {
    it('returns a 16-character string', () => {
      const uuid = CourierUtils.generateUUID();
      expect(uuid).toHaveLength(16);
    });

    it('only contains alphanumeric characters', () => {
      const uuid = CourierUtils.generateUUID();
      expect(uuid).toMatch(/^[A-Za-z0-9]{16}$/);
    });

    it('generates unique values on successive calls', () => {
      const ids = new Set(Array.from({ length: 50 }, () => CourierUtils.generateUUID()));
      expect(ids.size).toBe(50);
    });
  });

  describe('getPackageVersion', () => {
    it('returns a semver-like string', () => {
      const version = CourierUtils.getPackageVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});
