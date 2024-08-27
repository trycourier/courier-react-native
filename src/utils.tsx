import packageJson from '../package.json';

export namespace Events {

  export namespace Log {
    export const DEBUG_LOG = 'courierDebugEvent';
  }
  
  export namespace Push {
    export const CLICKED = 'pushNotificationClicked';
    export const DELIVERED = 'pushNotificationDelivered';
  }

}

export class Utils {

  static generateUUID(): string {
    let uuid = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
      uuid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uuid;
  }

  static getPackageVersion(): string {
    return packageJson.version;
  }

}