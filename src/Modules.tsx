import { NativeModules, Platform } from "react-native";

export class Modules {

  static readonly LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

  static readonly Client = Modules.getNativeModule(NativeModules.CourierClientModule);
  static readonly Shared = Modules.getNativeModule(NativeModules.CourierSharedModule);

  static getNativeModule<T>(nativeModule: T | undefined): T {
    return nativeModule
      ? nativeModule
      : new Proxy(
          {},
          {
            get() {
              throw new Error(Modules.LINKING_ERROR);
            },
          }
        ) as T;
  }

}