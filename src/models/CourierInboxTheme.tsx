export interface CourierInboxFont {
  family?: string
  size?: number
  color?: string
}

export interface CourierInboxButtonStyles {
  font?: CourierInboxFont
  backgroundColor?: string
  cornerRadius?: number
}

export default interface CourierInboxTheme {
  unreadIndicatorBarColor?: string
  loadingIndicatorColor?: string
  titleFont?: CourierInboxFont
  timeFont?: CourierInboxFont
  bodyFont?: CourierInboxFont
  detailTitleFont?: CourierInboxFont
  buttonStyles?: CourierInboxButtonStyles
  iOS?: {
    messageAnimationStyle?: 'fade' | 'right' | 'left' | 'top' | 'bottom' | 'none' | 'middle' | 'automatic',
    cellStyles?: {
      separatorStyle?: 'none' | 'singleLine' | 'singleLineEtched',
      separatorInsets?: { top?: number, left?: number, bottom?: number, right?: number },
      separatorColor?: string,
      selectionStyle?: 'none' | 'blue' | 'gray' | 'default'
    }
  }
}