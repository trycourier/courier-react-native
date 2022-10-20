import { NativeModules } from 'react-native';
import Courier from '../index';
import {
  setPlatform,
  SIGN_IN_RETURN_VALUE,
  NOTIFICATION_PERMISSION_RETURN_VALUE,
  NOTIFICATION_PERMISSION_STATUS,
  FCM_TOKEN_VALUE,
  CURRENT_USER_ID,
  CURRENT_APNS_TOKEN,
  SIGN_OUT_VALUE,
  SET_FCM_TOKEN_VALUE,
} from '../__mocks__/native-module-bridge';

const {
  signIn,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  getFcmToken,
  getUserId,
  getApnsToken,
  signOut,
  setFcmToken,
  iOSForegroundPresentationOptions,
} = NativeModules.CourierReactNative;

beforeEach(() => {
  setPlatform('android');
});

describe('native module signIn function', () => {
  const userId = 'userId';
  const token = 'token';
  it('Should call CourierReactNative signIn function', async () => {
    await Courier.signIn({
      userId,
      accessToken: token,
    });
    expect(signIn).toBeCalledWith(userId, token);
  });
  it(`Should return  ${SIGN_IN_RETURN_VALUE}`, async () => {
    const singInResult = await Courier.signIn({ userId, accessToken: token });
    expect(singInResult).toBe(SIGN_IN_RETURN_VALUE);
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
    Courier.notificationPermissionStatus;
    expect(getNotificationPermissionStatus).toBeCalledWith();
  });
  it(`Should return ${NOTIFICATION_PERMISSION_STATUS}`, () => {
    expect(Courier.notificationPermissionStatus).toBe(
      NOTIFICATION_PERMISSION_STATUS
    );
  });
});

describe('native module getFcmToken function', () => {
  it('Should call getFcmToken function', () => {
    Courier.fcmToken;
    expect(getFcmToken).toBeCalledWith();
  });

  it(`Should return ${FCM_TOKEN_VALUE}`, () => {
    expect(Courier.fcmToken).toBe(FCM_TOKEN_VALUE);
  });
});

describe('native module getUserId function', () => {
  it('Should call getUserId function', () => {
    Courier.userId;
    expect(getUserId).toBeCalledWith();
  });

  it(`Should return ${CURRENT_USER_ID}`, () => {
    expect(Courier.userId).toBe(CURRENT_USER_ID);
  });
});

describe('native module  getApnsToken function', () => {
  it('Should not call getApnsToken  function', () => {
    setPlatform('android');
    Courier.apnsToken;
    expect(getApnsToken).not.toBeCalled();
  });

  it('Should call getApnsToken  function', () => {
    setPlatform('ios');
    Courier.apnsToken;
    expect(getApnsToken).toBeCalledWith();
  });

  it(`Should return ${CURRENT_APNS_TOKEN}`, () => {
    setPlatform('ios');
    expect(Courier.apnsToken).toBe(CURRENT_APNS_TOKEN);
  });
});

describe('native module singOut function', () => {
  it('Should call signOut function', () => {
    Courier.signOut();
    expect(signOut).toBeCalledWith();
  });
  it(`Should return ${SIGN_OUT_VALUE}`, () => {
    expect(Courier.signOut()).toBe(SIGN_OUT_VALUE);
  });
});

describe('native module setFcmToken function', () => {
  const fcmToken = 'dummyFcmToken';
  it('Should call setFcmToken function', () => {
    Courier.setFcmToken(fcmToken);
    expect(setFcmToken).toBeCalledWith(fcmToken);
  });
  it(`Should return ${SIGN_OUT_VALUE}`, () => {
    expect(Courier.setFcmToken()).toBe(SET_FCM_TOKEN_VALUE);
  });
});

describe('native module iOSForegroundPresentationOptions', () => {

  const foreGroundOptions = { options: ['badge', 'list'] };

  it('should not call iOSForegroundPresentationOptions', () => {
    setPlatform('android');
    Courier.iOSForegroundPresentationOptions(foreGroundOptions);
    expect(iOSForegroundPresentationOptions).not.toBeCalled();
  });

  it('should call iOSForegroundPresentationOptions', () => {
    setPlatform('ios');
    Courier.iOSForegroundPresentationOptions(foreGroundOptions);
    expect(iOSForegroundPresentationOptions).toBeCalledWith(foreGroundOptions);
  });

  it('should not return anything', () => {
    setPlatform('ios');
    expect(
      Courier.iOSForegroundPresentationOptions(foreGroundOptions)
    ).toBeUndefined();
  });
  
});
