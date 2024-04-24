import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

export function emitEvent(eventName: string, eventData?: any): void {
  eventEmitter.emit(eventName, eventData);
}

export function addListener(eventName: string, listener: (...args: any[]) => void): void {
  eventEmitter.on(eventName, listener);
}

export function removeListener(eventName: string, listener: (...args: any[]) => void): void {
  eventEmitter.off(eventName, listener);
}