jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => () => null),
    Client: {
      addClient: jest.fn(() => 'mock-client-id'),
      removeClient: jest.fn(() => 'mock-client-id'),
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

import { CourierClient } from '../client/CourierClient';
import { EU_COURIER_API_URLS } from '../CourierApiUrls';
import { Modules } from '../Modules';

describe('CourierClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registers itself via Modules.Client.addClient', () => {
    new CourierClient({ userId: 'u1', showLogs: false });

    expect(Modules.Client.addClient).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', showLogs: false })
    );
  });

  it('exposes the clientId returned by addClient', () => {
    const client = new CourierClient({ userId: 'u1', showLogs: false });
    expect(client.clientId).toBe('mock-client-id');
  });

  it('stores options on the instance', () => {
    const client = new CourierClient({
      userId: 'user-abc',
      jwt: 'jwt-token',
      clientKey: 'ck-1',
      tenantId: 'tenant-1',
      showLogs: true,
    });

    expect(client.options.userId).toBe('user-abc');
    expect(client.options.jwt).toBe('jwt-token');
    expect(client.options.clientKey).toBe('ck-1');
    expect(client.options.tenantId).toBe('tenant-1');
    expect(client.options.showLogs).toBe(true);
  });

  it('defaults showLogs when omitted', () => {
    const client = new CourierClient({ userId: 'u1' });
    expect(typeof client.options.showLogs).toBe('boolean');
  });

  it('clones apiUrls so external mutations are isolated', () => {
    const urls = { ...EU_COURIER_API_URLS };
    const client = new CourierClient({ userId: 'u1', apiUrls: urls });

    urls.rest = 'https://mutated.example.com';
    expect(client.options.apiUrls!.rest).toBe(EU_COURIER_API_URLS.rest);
  });

  it('leaves apiUrls undefined when not provided', () => {
    const client = new CourierClient({ userId: 'u1' });
    expect(client.options.apiUrls).toBeUndefined();
  });

  it('creates sub-client instances', () => {
    const client = new CourierClient({ userId: 'u1', showLogs: false });

    expect(client.tokens).toBeDefined();
    expect(client.brands).toBeDefined();
    expect(client.inbox).toBeDefined();
    expect(client.preferences).toBeDefined();
    expect(client.tracking).toBeDefined();
  });

  it('sub-clients share the same clientId', () => {
    const client = new CourierClient({ userId: 'u1', showLogs: false });

    expect(client.tokens.clientId).toBe('mock-client-id');
    expect(client.brands.clientId).toBe('mock-client-id');
    expect(client.inbox.clientId).toBe('mock-client-id');
    expect(client.preferences.clientId).toBe('mock-client-id');
    expect(client.tracking.clientId).toBe('mock-client-id');
  });

  it('remove() calls Modules.Client.removeClient', () => {
    const client = new CourierClient({ userId: 'u1', showLogs: false });
    const result = client.remove();

    expect(Modules.Client.removeClient).toHaveBeenCalledWith('mock-client-id');
    expect(result).toBe('mock-client-id');
  });
});
