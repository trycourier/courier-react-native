import { NativeModules, Platform } from 'react-native';
import * as Courier from '../index';
import {
  setPlatform,
  SIGN_IN_RETURN_VALUE,
  NOTIFICATION_PERMISSION_RETURN_VALUE,
  NOTIFICATION_PERMISSION_STATUS,
  FCM_TOKEN_VALUE,
} from '../__mocks__/native-module-bridge';

const {
  signIn,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  getFcmToken,
} = NativeModules.CourierReactNative;

describe('native module signIn function', () => {
  const userId = 'userId';
  const token = 'token';
  it('Should call CourierReactNative signIn function', () => {
    Courier.signIn({
      userId,
      accessToken: token,
    });
    expect(signIn).toBeCalledWith(userId, token);
  });
  it(`Should return  ${SIGN_IN_RETURN_VALUE}`, () => {
    expect(Courier.signIn({ userId, accessToken: token })).toBe(
      SIGN_IN_RETURN_VALUE
    );
  });
});

describe('native module requestNotificationPermission', () => {
  it('Should call requestNotificationPermission function', () => {
    Courier.requestNotificationPermission();
    expect(requestNotificationPermission).toBeCalledWith();
  });
  it(`should return ${NOTIFICATION_PERMISSION_RETURN_VALUE}`, () => {
    expect(Courier.requestNotificationPermission()).toBe(
      NOTIFICATION_PERMISSION_RETURN_VALUE
    );
  });
});

describe('native module getNotificationPermissionStatus function', () => {
  it('Should call getNotificationPermissionStatus function', () => {
    Courier.getNotificationPermissionStatus();
    expect(getNotificationPermissionStatus).toBeCalledWith();
  });
  it(`Should return ${NOTIFICATION_PERMISSION_STATUS}`, () => {
    expect(Courier.getNotificationPermissionStatus()).toBe(
      NOTIFICATION_PERMISSION_STATUS
    );
  });
});

describe('native module getFcmToken function', () => {
  it('Should call getFcmToken function', () => {
    Courier.getFcmToken();
    expect(getFcmToken).toBeCalledWith();
  });

  it(`Should return ${FCM_TOKEN_VALUE}`, () => {
    expect(Courier.getFcmToken()).toBe(FCM_TOKEN_VALUE);
  });
});
