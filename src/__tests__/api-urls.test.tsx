jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => 'mock-native-component'),
    Client: {
      addClient: jest.fn(() => 'client-id'),
      removeClient: jest.fn(() => 'client-id')
    },
    Shared: {
      attachEmitter: jest.fn(() => Promise.resolve('emitter-id')),
      signIn: jest.fn(() => Promise.resolve())
    },
    System: {
      setIOSForegroundPresentationOptions: jest.fn(() => 'ok')
    }
  }
}));

jest.mock('../Broadcaster', () =>
  jest.fn().mockImplementation(() => ({
    addListener: jest.fn(() => Promise.resolve(undefined))
  }))
);

import Courier, {
  CourierClient,
  DEFAULT_COURIER_API_URLS,
  EU_COURIER_API_URLS,
  getCourierApiUrlsForRegion
} from '../index';
import { Modules } from '../Modules';

describe('CourierApiUrls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a cloned EU preset', () => {
    const apiUrls = getCourierApiUrlsForRegion('eu');

    expect(apiUrls).toEqual(EU_COURIER_API_URLS);
    expect(apiUrls).not.toBe(EU_COURIER_API_URLS);
  });

  it('passes apiUrls when creating a client', () => {
    const client = new CourierClient({
      userId: 'user-123',
      showLogs: true,
      apiUrls: EU_COURIER_API_URLS
    });

    expect(client.options.apiUrls).toEqual(EU_COURIER_API_URLS);
    expect(Modules.Client.addClient).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        apiUrls: EU_COURIER_API_URLS
      })
    );
  });

  it('passes apiUrls during shared sign in', async () => {
    await Courier.shared.signIn({
      accessToken: 'jwt',
      userId: 'user-123',
      apiUrls: DEFAULT_COURIER_API_URLS
    });

    expect(Modules.Shared.signIn).toHaveBeenCalledWith(
      'jwt',
      undefined,
      'user-123',
      undefined,
      DEFAULT_COURIER_API_URLS,
      expect.any(Boolean)
    );
  });
});
