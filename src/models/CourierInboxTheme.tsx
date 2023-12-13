export interface CourierInboxFont {
  family?: string
  size?: number
  color?: string
}

export interface CourierInboxButtonStyle {
  unread?: CourierInboxButton
  read?: CourierInboxButton
}

export interface CourierInboxButton {
  font?: CourierInboxFont
  backgroundColor?: string
  cornerRadius?: number
}

export interface CourierInboxTextStyle {
  unread?: CourierInboxFont
  read?: CourierInboxFont
}

export interface CourierInboxInfoViewStyle {
  font?: CourierInboxFont
  button?: CourierInboxButton
}

export interface CourierInboxUnreadIndicatorStyle {
  indicator?: 'dot' | 'line'
  color?: string
}

export interface CourierInboxTheme {
  loadingIndicatorColor?: string
  unreadIndicatorStyle?: CourierInboxUnreadIndicatorStyle
  titleStyle?: CourierInboxTextStyle
  timeStyle?: CourierInboxTextStyle
  bodyStyle?: CourierInboxTextStyle
  buttonStyle?: CourierInboxButtonStyle
  infoViewStyle?: CourierInboxInfoViewStyle
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