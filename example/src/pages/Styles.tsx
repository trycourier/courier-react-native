import { Platform } from "react-native"

export const Styles = (isDark: boolean) => {
  return {
    Fonts: {
      heading: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf',
      title: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf',
      subtitle: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'
    },
    Colors: {
      heading: isDark ? '#9747FF' : '#9747FF',
      title: isDark ? '#FFFFFF' : '#000000',
      subtitle: isDark ? '#9A9A9A' : '#BEBEBE',
      option: isDark ? '#1F1F1F' : '#F0F0F0',
      action: isDark ? '#9747FF' : '#9747FF',
    },
    TextSizes: {
      heading: 24,
      title: 18,
      subtitle: 16,
    },
    Corners: {
      button: 100
    }
  }
}