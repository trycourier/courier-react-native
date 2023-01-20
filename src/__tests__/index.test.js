import {
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import Courier, { CourierProvider } from '../index';

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
  SEND_PUSH_NOTIFICATION_STATUS,
  IOS_FOREGROUND_PRESENTATION_OPTIONS,
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
  sendPush,
  setDebugMode,
  registerPushNotificationClickedOnKilledState,
} = NativeModules.CourierReactNative;

const userId = 'userId';
const token = 'token';
const title = 'this is dummy title';
const body = 'this is dummy body';
const providers = [CourierProvider.APNS, CourierProvider.FCM];
const isDebugging = true;
const COURIER_DEBUG_EVENT = 'courierDebugEvent';
const COURIER_DEBUG_LOG = 'test log';
const PUSH_NOTIFICATION_CLICKED = 'pushNotificationClicked';
const PUSH_NOTIFICATION_DELIVERED = 'pushNotificationDelivered';

beforeEach(() => {
  setPlatform('android');
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('native module signIn function', () => {
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
  it('Should call requestNotificationPermission function', async () => {
    await Courier.requestNotificationPermission();
    expect(requestNotificationPermission).toBeCalledWith();
  });
  it(`should return ${NOTIFICATION_PERMISSION_RETURN_VALUE}`, async () => {
    const permission = await Courier.requestNotificationPermission();
    expect(permission).toBe(NOTIFICATION_PERMISSION_RETURN_VALUE);
  });
});

describe('native module getNotificationPermissionStatus function', () => {
  it('Should call getNotificationPermissionStatus function', async () => {
    await Courier.notificationPermissionStatus;
    expect(getNotificationPermissionStatus).toBeCalledWith();
  });
  it(`Should return ${NOTIFICATION_PERMISSION_STATUS}`, async () => {
    const permissionStatus = await Courier.notificationPermissionStatus;
    expect(permissionStatus).toBe(NOTIFICATION_PERMISSION_STATUS);
  });
});

describe('native module getFcmToken function', () => {
  it('Should call getFcmToken function', async () => {
    await Courier.fcmToken;
    expect(getFcmToken).toBeCalledWith();
  });

  it(`Should return ${FCM_TOKEN_VALUE}`, async () => {
    const currentToken = await Courier.fcmToken;
    expect(currentToken).toBe(FCM_TOKEN_VALUE);
  });
});

describe('native module getUserId function', () => {
  it('Should call getUserId function', async () => {
    await Courier.userId;
    expect(getUserId).toBeCalledWith();
  });

  it(`Should return ${CURRENT_USER_ID}`, async () => {
    const currentUserId = await Courier.userId;
    expect(currentUserId).toBe(CURRENT_USER_ID);
  });
});

describe('native module  getApnsToken function', () => {
  it('Should not call getApnsToken  function', async () => {
    setPlatform('android');
    await Courier.apnsToken;
    expect(getApnsToken).not.toBeCalled();
  });

  it('Should call getApnsToken  function', async () => {
    setPlatform('ios');
    await Courier.apnsToken;
    expect(getApnsToken).toBeCalledWith();
  });

  it(`Should return ${CURRENT_APNS_TOKEN}`, async () => {
    setPlatform('ios');
    const currentApnsToken = await Courier.apnsToken;
    expect(currentApnsToken).toBe(CURRENT_APNS_TOKEN);
  });
});

describe('native module singOut function', () => {
  it('Should call signOut function', async () => {
    await Courier.signOut();
    expect(signOut).toBeCalledWith();
  });
  it(`Should return ${SIGN_OUT_VALUE}`, async () => {
    const signOutValue = await Courier.signOut();
    expect(signOutValue).toBe(SIGN_OUT_VALUE);
  });
});

describe('native module setFcmToken function', () => {
  const fcmToken = 'dummyFcmToken';
  it('Should call setFcmToken function', async () => {
    await Courier.setFcmToken(fcmToken);
    expect(setFcmToken).toBeCalledWith(fcmToken);
  });
  it(`Should return ${SET_FCM_TOKEN_VALUE}`, async () => {
    const setFcmTokenValue = await Courier.setFcmToken();
    expect(setFcmTokenValue).toBe(SET_FCM_TOKEN_VALUE);
  });
});

describe('native module iOSForegroundPresentationOptions', () => {
  const foreGroundOptions = { options: ['badge', 'list'] };

  it('should not call iOSForegroundPresentationOptions', async () => {
    setPlatform('android');
    await Courier.iOSForegroundPresentationOptions(foreGroundOptions);
    expect(iOSForegroundPresentationOptions).not.toBeCalled();
  });

  it('should call iOSForegroundPresentationOptions', async () => {
    setPlatform('ios');
    await Courier.iOSForegroundPresentationOptions(foreGroundOptions);
    expect(iOSForegroundPresentationOptions).toBeCalledWith(foreGroundOptions);
  });

  it('should not return anything', async () => {
    setPlatform('ios');
    const iOSForegroundPresentationOptionsResult =
      await Courier.iOSForegroundPresentationOptions(foreGroundOptions);
    expect(iOSForegroundPresentationOptionsResult).toBe(
      IOS_FOREGROUND_PRESENTATION_OPTIONS
    );
  });
});

describe('native module sendPush', () => {
  it('Should call sendPush', async () => {
    await Courier.sendPush({
      userId,
      authKey: token,
      title,
      body,
      providers,
    });
    expect(sendPush).toBeCalledWith(token, userId, title, body, providers);
  });

  it(`Should return ${SEND_PUSH_NOTIFICATION_STATUS}`, async () => {
    const res = await Courier.sendPush({
      userId,
      authKey: token,
      title,
      body,
      providers,
    });
    expect(res).toBe(SEND_PUSH_NOTIFICATION_STATUS);
  });
});

describe('native module setDebugMode', () => {
  it('should call setDebugMode', async () => {
    await Courier.setIsDebugging(isDebugging);
    expect(setDebugMode).toBeCalledWith(isDebugging);
  });
  it(`should return ${isDebugging}`, async () => {
    const currentDebuggingStatus = await Courier.setIsDebugging(isDebugging);
    expect(currentDebuggingStatus).toBe(isDebugging);
  });
  it(`should catch ${COURIER_DEBUG_EVENT}`, async () => {
    const eventEmitter = new NativeEventEmitter();
    console.log = jest.fn();
    await Courier.setIsDebugging(isDebugging);
    eventEmitter.emit(COURIER_DEBUG_EVENT, COURIER_DEBUG_LOG);
    expect(console.log.mock.calls[0][2]).toBe(COURIER_DEBUG_LOG);
  });
  it(`should not catch ${COURIER_DEBUG_EVENT}`, async () => {
    const eventEmitter = new NativeEventEmitter();
    console.log = jest.fn();
    await Courier.setIsDebugging(!isDebugging);
    eventEmitter.emit(COURIER_DEBUG_EVENT, COURIER_DEBUG_LOG);
    expect(console.log).not.toBeCalled();
  });
});

describe('native module isDebugging', () => {
  it(`should retun isDebugging ${isDebugging}`, async () => {
    await Courier.setIsDebugging(isDebugging);
    const currentlyDebugging = await Courier.isDebugging;
    expect(currentlyDebugging).toBe(isDebugging);
  });
  it(`should retun isDebugging ${!isDebugging}`, async () => {
    await Courier.setIsDebugging(!isDebugging);
    const currentlyDebugging = await Courier.isDebugging;
    expect(currentlyDebugging).toBe(!isDebugging);
  });
});

describe('test registerPushNotificationListeners', () => {
  it(`should call native module registerPushNotificationClickedOnKilledState`, () => {
    Courier.registerPushNotificationListeners({
      onPushNotificationClicked: jest.fn(),
      onPushNotificationDelivered: jest.fn(),
    });
    expect(registerPushNotificationClickedOnKilledState).toBeCalledWith();
  });
  it('Should handle notification events for android', () => {
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const testJson = { test: 'test' };
    Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });

    const eventEmitter = new NativeEventEmitter();
    eventEmitter.emit(PUSH_NOTIFICATION_DELIVERED, JSON.stringify(testJson));
    expect(deliverNotificationfn).toBeCalledWith(testJson);
    eventEmitter.emit(PUSH_NOTIFICATION_CLICKED, JSON.stringify(testJson));
    expect(clickNotificaitonfn).toBeCalledWith(testJson);
  });

  it('Should throw  error in handle notification events for android', () => {
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const parsingErrorMessage = 'Unexpected token o in JSON at position 1';
    const testJson = { test: 'test' };
    Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });
    console.log = jest.fn();

    const eventEmitter = new NativeEventEmitter();
    eventEmitter.emit(PUSH_NOTIFICATION_DELIVERED, testJson);
    expect(console.log.mock.calls[0][0].message).toBe(parsingErrorMessage);
    eventEmitter.emit(PUSH_NOTIFICATION_CLICKED, testJson);
    expect(console.log.mock.calls[1][0].message).toBe(parsingErrorMessage);
  });

  it('Should handle notification events for ios', () => {
    setPlatform('ios');
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const testJson = { test: 'test' };
    Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });

    DeviceEventEmitter.emit(
      PUSH_NOTIFICATION_DELIVERED,
      JSON.stringify(testJson)
    );
    expect(deliverNotificationfn).toBeCalledWith(testJson);
    DeviceEventEmitter.emit(
      PUSH_NOTIFICATION_CLICKED,
      JSON.stringify(testJson)
    );
    expect(clickNotificaitonfn).toBeCalledWith(testJson);
  });

  it('Should throw  error in handle notification events for ios', () => {
    setPlatform('ios');
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const parsingErrorMessage = 'Unexpected token o in JSON at position 1';
    const testJson = { test: 'test' };
    Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });
    console.log = jest.fn();

    DeviceEventEmitter.emit(PUSH_NOTIFICATION_DELIVERED, testJson);
    expect(console.log.mock.calls[0][0].message).toBe(parsingErrorMessage);
    DeviceEventEmitter.emit(PUSH_NOTIFICATION_CLICKED, testJson);
    expect(console.log.mock.calls[1][0].message).toBe(parsingErrorMessage);
  });

  it('should check for cancel subscription in android', () => {
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const testJson = { test: 'test' };
    const unsubscribe = Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });

    unsubscribe();

    const eventEmitter = new NativeEventEmitter();
    eventEmitter.emit(PUSH_NOTIFICATION_DELIVERED, JSON.stringify(testJson));
    expect(deliverNotificationfn).not.toBeCalled();
    eventEmitter.emit(PUSH_NOTIFICATION_CLICKED, JSON.stringify(testJson));
    expect(clickNotificaitonfn).not.toBeCalled();
  });

  it('should check for cancel subscription in ios', () => {
    const clickNotificaitonfn = jest.fn();
    const deliverNotificationfn = jest.fn();
    const testJson = { test: 'test' };
    const unsubscribe = Courier.registerPushNotificationListeners({
      onPushNotificationClicked: clickNotificaitonfn,
      onPushNotificationDelivered: deliverNotificationfn,
    });

    unsubscribe();

    DeviceEventEmitter.emit(
      PUSH_NOTIFICATION_DELIVERED,
      JSON.stringify(testJson)
    );
    expect(deliverNotificationfn).not.toBeCalled();
    DeviceEventEmitter.emit(
      PUSH_NOTIFICATION_CLICKED,
      JSON.stringify(testJson)
    );
    expect(clickNotificaitonfn).not.toBeCalled();
  });
});
