import { CourierButton } from "./CourierButton"
import { CourierFont } from "./CourierFont"
import { CourierInfoViewStyle } from "./CourierInfoViewStyle"

export interface CourierInboxButtonStyle {
  unread?: CourierButton
  read?: CourierButton
}

export interface CourierInboxTextStyle {
  unread?: CourierFont
  read?: CourierFont
}

export interface CourierInboxUnreadIndicatorStyle {
  indicator?: 'dot' | 'line'
  color?: string
}

export interface CourierInboxTheme {
  brandId?: string,
  loadingIndicatorColor?: string
  unreadIndicatorStyle?: CourierInboxUnreadIndicatorStyle
  titleStyle?: CourierInboxTextStyle
  timeStyle?: CourierInboxTextStyle
  bodyStyle?: CourierInboxTextStyle
  buttonStyle?: CourierInboxButtonStyle
  infoViewStyle?: CourierInfoViewStyle
  iOS?: {
    messageAnimationStyle?: 'fade' | 'right' | 'left' | 'top' | 'bottom' | 'none' | 'middle' | 'automatic',
    cellStyles?: {
      separatorStyle?: 'none' | 'singleLine' | 'singleLineEtched',
      separatorInsets?: { top?: number, left?: number, bottom?: number, right?: number },
      separatorColor?: string,
      selectionStyle?: 'none' | 'blue' | 'gray' | 'default',
    }
  },
  android?: {
    dividerItemDecoration?: 'none' | 'vertical',
  }
}