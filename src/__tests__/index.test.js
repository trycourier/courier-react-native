import { NativeModules } from 'react-native';
import * as Courier from '../index';
import {
  setPlatform,
  SIGN_IN_RETURN_VALUE,
  NOTIFICATION_PERMISSION_RETURN_VALUE,
  NOTIFICATION_PERMISSION_STATUS,
  FCM_TOKEN_VALUE,
  CURRENT_USER_ID,
  CURRENT_APNS_TOKEN,
  SIGN_OUT_VALUE,
} from '../__mocks__/native-module-bridge';

const {
  signIn,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  getFcmToken,
  getUserId,
  getApnsToken,
  signOut,
} = NativeModules.CourierReactNative;

beforeEach(() => {
  setPlatform('');
});

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

describe('native module getUserId function', () => {
  it('Should call getUserId function', () => {
    Courier.getUserId();
    expect(getUserId).toBeCalledWith();
  });

  it(`Should return ${CURRENT_USER_ID}`, () => {
    expect(Courier.getUserId()).toBe(CURRENT_USER_ID);
  });
});

describe('native module  getApnsToken function', () => {
  it('Should not call getApnsToken  function', () => {
    setPlatform('android');
    Courier.getApnsToken();
    expect(getApnsToken).not.toBeCalled();
  });

  it('Should call getApnsToken  function', () => {
    setPlatform('ios');
    Courier.getApnsToken();
    expect(getApnsToken).toBeCalledWith();
  });

  it(`Should return ${CURRENT_APNS_TOKEN}`, () => {
    setPlatform('ios');
    expect(Courier.getApnsToken()).toBe(CURRENT_APNS_TOKEN);
  });
});

describe('native module singOut function', () => {
  it('Should call signOut function', () => {
    Courier.signOut();
    expect(signOut).toBeCalledWith();
  });
  it(`Should reeturn ${SIGN_OUT_VALUE}`, () => {
    expect(Courier.signOut()).toBe(SIGN_OUT_VALUE);
  });
});
