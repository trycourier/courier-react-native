jest.mock('../Modules', () => ({
  Modules: {
    getNativeComponent: jest.fn(() => 'mock-native-component'),
    Client: {
      addClient: jest.fn(() => 'client-id'),
      removeClient: jest.fn(() => 'client-id'),
    },
    Shared: {
      attachEmitter: jest.fn(() => Promise.resolve('emitter-id')),
      signIn: jest.fn(() => Promise.resolve()),
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

import Courier, {
  CourierClient,
  CourierInboxListener,
  CourierPushListener,
  CourierAuthenticationListener,
  CourierPushProvider,
  CourierTrackingEvent,
  CourierUserPreferencesStatus,
  CourierUserPreferencesChannel,
  DEFAULT_COURIER_API_URLS,
  EU_COURIER_API_URLS,
  getCourierApiUrlsForRegion,
  CourierUtils,
} from '../index';

describe('Package barrel exports', () => {
  it('exports Courier as default', () => {
    expect(Courier).toBeDefined();
    expect(Courier.shared).toBeDefined();
  });

  it('exports CourierClient', () => {
    expect(CourierClient).toBeDefined();
  });

  it('exports listener classes', () => {
    expect(CourierInboxListener).toBeDefined();
    expect(CourierPushListener).toBeDefined();
    expect(CourierAuthenticationListener).toBeDefined();
  });

  it('exports push provider enum', () => {
    expect(CourierPushProvider.APN).toBe('apn');
    expect(CourierPushProvider.FIREBASE_FCM).toBe('firebase-fcm');
    expect(CourierPushProvider.EXPO).toBe('expo');
    expect(CourierPushProvider.ONE_SIGNAL).toBe('onesignal');
    expect(CourierPushProvider.PUSHER_BEAMS).toBe('pusher-beams');
  });

  it('exports tracking event enum', () => {
    expect(CourierTrackingEvent.Clicked).toBe('CLICKED');
    expect(CourierTrackingEvent.Delivered).toBe('DELIVERED');
    expect(CourierTrackingEvent.Opened).toBe('OPENED');
    expect(CourierTrackingEvent.Read).toBe('READ');
    expect(CourierTrackingEvent.Unread).toBe('UNREAD');
  });

  it('exports user preferences status enum', () => {
    expect(CourierUserPreferencesStatus.OptedIn).toBe('OPTED_IN');
    expect(CourierUserPreferencesStatus.OptedOut).toBe('OPTED_OUT');
    expect(CourierUserPreferencesStatus.Required).toBe('REQUIRED');
    expect(CourierUserPreferencesStatus.Unknown).toBe('UNKNOWN');
  });

  it('exports user preferences channel enum', () => {
    expect(CourierUserPreferencesChannel.DirectMessage).toBe('direct_message');
    expect(CourierUserPreferencesChannel.Email).toBe('email');
    expect(CourierUserPreferencesChannel.Push).toBe('push');
    expect(CourierUserPreferencesChannel.Sms).toBe('sms');
  });

  it('exports API URL presets', () => {
    expect(DEFAULT_COURIER_API_URLS).toBeDefined();
    expect(DEFAULT_COURIER_API_URLS.rest).toContain('api.courier.com');
    expect(EU_COURIER_API_URLS).toBeDefined();
    expect(EU_COURIER_API_URLS.rest).toContain('eu.courier.com');
  });

  it('exports getCourierApiUrlsForRegion', () => {
    expect(typeof getCourierApiUrlsForRegion).toBe('function');
  });

  it('exports CourierUtils', () => {
    expect(CourierUtils).toBeDefined();
    expect(typeof CourierUtils.generateUUID).toBe('function');
  });
});
