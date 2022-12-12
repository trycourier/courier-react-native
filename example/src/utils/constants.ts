import { CourierProvider } from '@trycourier/courier-react-native';
import type { ListItem } from '../components/List';

export const allProviders: ListItem[] = [
  {
    name: 'FCM',
    value: CourierProvider.FCM,
  },
  {
    name: 'APNS',
    value: CourierProvider.APNS,
  },
];

export type IosForegroundNotificationPreferencesType =
  | 'sound'
  | 'badge'
  | 'list'
  | 'banner';

export const allIOSPresentationOptions: ListItem[] = [
  {
    name: 'Sound',
    value: 'sound',
  },
  {
    name: 'List',
    value: 'list',
  },
  {
    name: 'Badge',
    value: 'badge',
  },
  {
    name: 'Banner',
    value: 'banner',
  },
];
