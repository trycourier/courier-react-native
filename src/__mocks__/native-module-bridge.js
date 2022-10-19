import { NativeModules, Platform } from 'react-native';
export const SIGN_IN_RETURN_VALUE = 'signIn successFul';
export const NOTIFICATION_PERMISSION_RETURN_VALUE = 'authorized';
export const NOTIFICATION_PERMISSION_STATUS = 'undetermined';
export const FCM_TOKEN_VALUE = 'fcmToken';
export const CURRENT_USER_ID = 'currentUserID';
export const CURRENT_APNS_TOKEN = 'CURRENT_APNS_TOKEN';

NativeModules.CourierReactNative = {
  signIn: jest.fn().mockReturnValue(SIGN_IN_RETURN_VALUE),
  requestNotificationPermission: jest
    .fn()
    .mockReturnValue(NOTIFICATION_PERMISSION_RETURN_VALUE),
  getNotificationPermissionStatus: jest
    .fn()
    .mockReturnValue(NOTIFICATION_PERMISSION_STATUS),
  getFcmToken: jest.fn().mockReturnValue(FCM_TOKEN_VALUE),
  getUserId: jest.fn().mockReturnValue(CURRENT_USER_ID),
  getApnsToken: jest.fn().mockReturnValue(CURRENT_APNS_TOKEN),
};

export const setPlatform = (os) => {
  Platform.OS = os;
};
