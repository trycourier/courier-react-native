import { CourierButton } from "./CourierButton";
import { CourierFont } from "./CourierFont"
import { CourierInfoViewStyle } from "./CourierInfoViewStyle";
import { iOS_CourierCell } from "./iOS_CourierCell";
import { iOS_CourierSheet } from "./iOS_CourierSheet";

export type CourierPreferencesChannel = 'direct_message' | 'email' | 'push' | 'sms' | 'webhook';

export type CourierPreferencesMode = 
  | { type: 'topic' }
  | { type: 'channels', channels: CourierPreferencesChannel[] };

export interface CourierPreferencesTheme {
  brandId?: string
  loadingIndicatorColor?: string
  sectionTitleFont?: CourierFont
  topicTitleFont?: CourierFont
  topicSubtitleFont?: CourierFont
  topicButton?: CourierButton
  sheetTitleFont?: CourierFont
  infoView?: CourierInfoViewStyle
  iOS?: {
    topicCellStyles?: iOS_CourierCell
    sheetSettingStyles?: iOS_CourierSheet
    sheetCornerRadius?: number
    sheetCellStyles?: iOS_CourierCell
  }
}