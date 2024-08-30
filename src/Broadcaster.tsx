import { NativeModule } from "react-native";
import { NativeEventEmitter, EmitterSubscription, Platform, DeviceEventEmitter } from "react-native";

export default class Broadcaster {

  private emitter: NativeEventEmitter;

  constructor(module: NativeModule) {
    this.emitter = new NativeEventEmitter(module);
  }

  /**
    * Creates an event listener for the native function
    * @param key Key for the listener
    * @param callback Value returned for the listener callback
    * @returns Subscription
    */
  addListener(id: string, callback: (value: any) => void): EmitterSubscription | undefined {

    if (Platform.OS === 'android') {
      return DeviceEventEmitter.addListener(id, (event: any) => callback(event));
    }

    if (Platform.OS === 'ios') {
      return this.emitter.addListener(id, (event: any) => callback(event));
    }

    return undefined;

  }

}