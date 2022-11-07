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

const mockFunctionReturningPromise = (str) =>
  jest.fn().mockImplementation(() => Promise.resolve(str));

NativeModules.CourierReactNative = {
  signIn: mockFunctionReturningPromise(SIGN_IN_RETURN_VALUE),
  requestNotificationPermission: mockFunctionReturningPromise(
    NOTIFICATION_PERMISSION_RETURN_VALUE
  ),
  getNotificationPermissionStatus: mockFunctionReturningPromise(
    NOTIFICATION_PERMISSION_STATUS
  ),
  getFcmToken: mockFunctionReturningPromise(FCM_TOKEN_VALUE),
  getUserId: mockFunctionReturningPromise(CURRENT_USER_ID),
  getApnsToken: mockFunctionReturningPromise(CURRENT_APNS_TOKEN),
  signOut: mockFunctionReturningPromise(SIGN_OUT_VALUE),
  setFcmToken: mockFunctionReturningPromise(SET_FCM_TOKEN_VALUE),
  iOSForegroundPresentationOptions: mockFunctionReturningPromise(
    IOS_FOREGROUND_PRESENTATION_OPTIONS
  ),
  sendPush: jest
    .fn()
    .mockImplementation((_a) => Promise.resolve(SEND_PUSH_NOTIFICATION_STATUS)),
  setDebugMode: jest.fn().mockImplementation((a) => Promise.resolve(a)),
  registerPushNotificationClickedOnKilledState: jest.fn(),
};

export const setPlatform = (os) => {
  Platform.OS = os;
};

__DEV__ = true;
