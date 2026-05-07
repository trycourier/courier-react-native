import {
  CourierUserPreferencesStatus,
  CourierUserPreferencesChannel,
  getCourierUserPreferencesStatusTitle,
  getCourierUserPreferencesChannelTitle,
} from '../models/CourierUserPreferences';

describe('CourierUserPreferencesStatus', () => {
  it('has the expected enum values', () => {
    expect(CourierUserPreferencesStatus.OptedIn).toBe('OPTED_IN');
    expect(CourierUserPreferencesStatus.OptedOut).toBe('OPTED_OUT');
    expect(CourierUserPreferencesStatus.Required).toBe('REQUIRED');
    expect(CourierUserPreferencesStatus.Unknown).toBe('UNKNOWN');
  });
});

describe('getCourierUserPreferencesStatusTitle', () => {
  it.each([
    [CourierUserPreferencesStatus.OptedIn, 'Opted In'],
    [CourierUserPreferencesStatus.OptedOut, 'Opted Out'],
    [CourierUserPreferencesStatus.Required, 'Required'],
    [CourierUserPreferencesStatus.Unknown, 'Unknown'],
  ])('maps %s → "%s"', (status, expected) => {
    expect(getCourierUserPreferencesStatusTitle(status)).toBe(expected);
  });

  it('returns "Unknown" for an unrecognized value', () => {
    expect(
      getCourierUserPreferencesStatusTitle(
        'INVALID' as CourierUserPreferencesStatus
      )
    ).toBe('Unknown');
  });
});

describe('CourierUserPreferencesChannel', () => {
  it('has the expected enum values', () => {
    expect(CourierUserPreferencesChannel.DirectMessage).toBe('direct_message');
    expect(CourierUserPreferencesChannel.Inbox).toBe('inbox');
    expect(CourierUserPreferencesChannel.Email).toBe('email');
    expect(CourierUserPreferencesChannel.Push).toBe('push');
    expect(CourierUserPreferencesChannel.Sms).toBe('sms');
    expect(CourierUserPreferencesChannel.Webhook).toBe('webhook');
    expect(CourierUserPreferencesChannel.Unknown).toBe('unknown');
  });
});

describe('getCourierUserPreferencesChannelTitle', () => {
  it.each([
    [CourierUserPreferencesChannel.DirectMessage, 'In App Messages'],
    [CourierUserPreferencesChannel.Inbox, 'Inbox'],
    [CourierUserPreferencesChannel.Email, 'Emails'],
    [CourierUserPreferencesChannel.Push, 'Push Notifications'],
    [CourierUserPreferencesChannel.Sms, 'Text Messages'],
    [CourierUserPreferencesChannel.Webhook, 'Webhooks'],
    [CourierUserPreferencesChannel.Unknown, 'Unknown'],
  ])('maps %s → "%s"', (channel, expected) => {
    expect(getCourierUserPreferencesChannelTitle(channel)).toBe(expected);
  });

  it('returns "Unknown" for an unrecognized value', () => {
    expect(
      getCourierUserPreferencesChannelTitle(
        'INVALID' as CourierUserPreferencesChannel
      )
    ).toBe('Unknown');
  });
});
