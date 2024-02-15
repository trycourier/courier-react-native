import { EmitterSubscription, Platform, DeviceEventEmitter, NativeEventEmitter } from "react-native";

export namespace Events {

  export namespace Log {
    export const DEBUG_LOG = 'courierDebugEvent';
  }
  
  export namespace Push {
    export const CLICKED = 'pushNotificationClicked';
    export const DELIVERED = 'pushNotificationDelivered';
  }

}

export namespace Utils {

  /**
  * Creates an event listener for the native function
  * @param key Key for the listener
  * @param callback Value returned for the listener callback
  * @returns Subscription
  */
  export function addEventListener(key: string, emitter: NativeEventEmitter, callback: (value: any) => void): EmitterSubscription | undefined {

    if (Platform.OS === 'android') {
      return DeviceEventEmitter.addListener(key, (event: any) => callback(event));
    }

    if (Platform.OS === 'ios') {
      return emitter.addListener(key, (event: any) => callback(event));
    }

    return undefined;

  }

  export function generateUUID(): string {
    let uuid = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
      uuid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uuid;
  }

}