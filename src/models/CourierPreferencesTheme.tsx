import { CourierFont } from "./CourierFont"

export type CourierPreferencesChannel = 'direct_message' | 'email' | 'push' | 'sms' | 'webhook';

export type CourierPreferencesMode = 
  | { type: 'topic' }
  | { type: 'channels', channels: CourierPreferencesChannel[] };

export interface CourierPreferencesTheme {
  brandId?: string
  loadingIndicatorColor?: string
  sectionTitleFont?: CourierFont
}