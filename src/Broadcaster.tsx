import {
  NativeEventEmitter,
  EmitterSubscription,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { Modules } from './Modules';

// React Native 0.80+ no longer exports the NativeModule type
type EmitterModule = ConstructorParameters<typeof NativeEventEmitter>[0];

export default class Broadcaster {
  private emitter: NativeEventEmitter;

  constructor(module: EmitterModule) {
    this.emitter = new NativeEventEmitter(module);
  }

  /**
   * Creates an event listener for the native function
   * @param key Key for the listener
   * @param callback Value returned for the listener callback
   * @returns Subscription
   */
  async addListener(
    id: string,
    callback: (value: any) => void
  ): Promise<EmitterSubscription | undefined> {
    await Modules.Shared.attachEmitter(id);

    if (Platform.OS === 'android') {
      return DeviceEventEmitter.addListener(id, (event: any) =>
        callback(event)
      );
    }

    if (Platform.OS === 'ios') {
      return this.emitter.addListener(id, (event: any) => callback(event));
    }

    return undefined;
  }
}
