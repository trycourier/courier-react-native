import { NativeModules, Platform } from 'react-native';
export const SIGN_IN_RETURN_VALUE = 'signIn successFul';
export const NOTIFICATION_PERMISSION_RETURN_VALUE = 'authorized';
export const NOTIFICATION_PERMISSION_STATUS = 'undetermined';
export const FCM_TOKEN_VALUE = 'fcmToken';
export const SET_FCM_TOKEN_VALUE = 'setFCMToken';
export const CURRENT_USER_ID = 'currentUserID';
export const CURRENT_APNS_TOKEN = 'CURRENT_APNS_TOKEN';
export const SIGN_OUT_VALUE = 'SIGN_OUT_VALUE';
export const IOS_FOREGROUND_PRESENTATION_OPTIONS =
  'IOS_FOREGROUND_PRESENTATION_OPTIONS';
export const SEND_PUSH_NOTIFICATION_STATUS = 'SEND_PUSH_NOTIFICATION_STATUS';

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
  signOut: jest.fn().mockReturnValue(SIGN_OUT_VALUE),
  setFcmToken: jest.fn().mockReturnValue(SET_FCM_TOKEN_VALUE),
  iOSForegroundPresentationOptions: jest.fn(),
  sendPush: jest
    .fn()
    .mockImplementation((a) => Promise.resolve(SEND_PUSH_NOTIFICATION_STATUS)),
  setDebugMode: jest.fn().mockImplementation((a) => Promise.resolve(a)),
  registerPushNotificationClickedOnKilledState: jest.fn(),
};

export const setPlatform = (os) => {
  Platform.OS = os;
};

__DEV__ = true;
