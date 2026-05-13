import {
  NativeModules,
  Platform,
  UIManager,
  TurboModuleRegistry,
  requireNativeComponent,
} from 'react-native';

export class Modules {
  static readonly LINKING_ERROR =
    `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

  static readonly Client = Modules.getNativeModule(
    'CourierClientModule',
    NativeModules.CourierClientModule
  );
  static readonly Shared = Modules.getNativeModule(
    'CourierSharedModule',
    NativeModules.CourierSharedModule
  );
  static readonly System = Modules.getNativeModule(
    'CourierSystemModule',
    NativeModules.CourierSystemModule
  );

  static getNativeModule<T>(
    moduleName: string,
    bridgeModule: T | undefined
  ): T {
    const resolved =
      (TurboModuleRegistry?.get(moduleName) as T | null) ??
      bridgeModule ??
      undefined;
    return resolved
      ? resolved
      : (new Proxy(
          {},
          {
            get() {
              throw new Error(Modules.LINKING_ERROR);
            },
          }
        ) as T);
  }

  static getNativeComponent(componentName: string) {
    return UIManager.getViewManagerConfig(componentName) != null
      ? requireNativeComponent<any>(componentName)
      : () => {
          throw new Error(Modules.LINKING_ERROR);
        };
  }
}
