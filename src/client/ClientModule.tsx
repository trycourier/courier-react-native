import { NativeModules, Platform } from "react-native";
import { CourierClientOptions } from "./CourierClient";

export abstract class ClientModule {

  static readonly LINKING_ERROR =
  `The package '@trycourier/courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

  static readonly NativeModule = NativeModules.CourierClientModule
  ? NativeModules.CourierClientModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(ClientModule.LINKING_ERROR);
        },
      }
    );

  readonly clientId: string;

  // Creates a low level CourierClient that routes the requests
  constructor(options: CourierClientOptions) {
    this.clientId = ClientModule.NativeModule.addClient(options);
  }

  public remove(): string {
    return ClientModule.NativeModule.removeClient(this.clientId);
  }

}