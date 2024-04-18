import { Android_CourierSheet } from "./Android_CourierSheet";
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
  infoViewStyle?: CourierInfoViewStyle
  iOS?: {
    topicCellStyles?: iOS_CourierCell
    sheetSettingStyles?: iOS_CourierSheet
    sheetCornerRadius?: number
    sheetCellStyles?: iOS_CourierCell
  },
  android?: {
    topicDividerItemDecoration?: 'none' | 'vertical'
    sheetDividerItemDecoration?: 'none' | 'vertical'
    sheetSettingStyles?: Android_CourierSheet
  }
}