import { NativeModules, Platform } from 'react-native';
export const SIGN_IN_RETURN_VALUE = 'signIn successFul';
export const NOTIFICATION_PERMISSION_RETURN_VALUE = 'authorized';
export const NOTIFICATION_PERMISSION_STATUS = 'undetermined';
export const FCM_TOKEN_VALUE = 'fcmToken';

NativeModules.CourierReactNative = {
  signIn: jest.fn().mockReturnValue(SIGN_IN_RETURN_VALUE),
  requestNotificationPermission: jest
    .fn()
    .mockReturnValue(NOTIFICATION_PERMISSION_RETURN_VALUE),
  getNotificationPermissionStatus: jest
    .fn()
    .mockReturnValue(NOTIFICATION_PERMISSION_STATUS),
  getFcmToken: jest.fn().mockReturnValue(FCM_TOKEN_VALUE),
};

export const setPlatform = (os) => {
  Platform.OS = os;
};
