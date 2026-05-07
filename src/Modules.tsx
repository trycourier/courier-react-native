import {
  NativeModules,
  Platform,
  TurboModuleRegistry,
  UIManager,
  requireNativeComponent,
} from 'react-native';

function getModule(moduleName: string): any {
  // Try TurboModuleRegistry first (New Architecture / bridgeless mode)
  const turboModule = TurboModuleRegistry.get(moduleName as any);
  if (turboModule) {
    return turboModule;
  }

  // Fall back to NativeModules (bridge mode / interop layer)
  const bridgeModule = NativeModules[moduleName];
  if (bridgeModule) {
    return bridgeModule;
  }

  return undefined;
}

export class Modules {
  static readonly LINKING_ERROR =
    `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

  static readonly Client = Modules.getNativeModule('CourierClientModule');
  static readonly Shared = Modules.getNativeModule('CourierSharedModule');
  static readonly System = Modules.getNativeModule('CourierSystemModule');

  static getNativeModule(moduleName: string): any {
    const nativeModule = getModule(moduleName);
    return nativeModule
      ? nativeModule
      : new Proxy(
          {},
          {
            get() {
              throw new Error(Modules.LINKING_ERROR);
            },
          }
        );
  }

  static getNativeComponent(componentName: string) {
    return UIManager.getViewManagerConfig(componentName) != null
      ? requireNativeComponent<any>(componentName)
      : () => {
          throw new Error(Modules.LINKING_ERROR);
        };
  }
}
