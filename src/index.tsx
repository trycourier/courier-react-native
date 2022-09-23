import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const CourierReactNative = NativeModules.CourierReactNative
  ? NativeModules.CourierReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return Promise.resolve(a * b);
}

interface SignInProps {
  userId: String;
  authToken: String;
}
export function signIn({ userId, authToken }: SignInProps): Promise<string> {
  return CourierReactNative.signIn(userId, authToken);
}

export function getFcmToken(): Promise<string> {
  return CourierReactNative.getFcmToken();
}

export function getUserId(): Promise<string> {
  return CourierReactNative.getUserId();
}

export function signOut(): Promise<string> {
  return CourierReactNative.signOut();
}

type SendPushProps = {
  authKey: string;
  userId: string;
  title?: string;
  body?: string;
};
export function sendPush({
  authKey,
  userId,
  title = 'This is a title',
  body = 'This is a messge',
}: SendPushProps): Promise<string> {
  return CourierReactNative.sendPush(authKey, userId, title, body);
}
