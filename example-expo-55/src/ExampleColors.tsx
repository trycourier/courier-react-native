import { useTheme } from '@react-navigation/native';

// Colors for the example's own screens, which are plain React Native views and
// don't follow dark mode on their own. The light values are the ones the
// screens always used.
export const useExampleColors = () => {
  const { dark } = useTheme();

  return {
    background: dark ? '#000000' : '#f5f5f5',
    card: dark ? '#1c1c1e' : '#ffffff',
    text: dark ? '#e5e5e7' : '#000000',
    label: dark ? '#e5e5e7' : '#333333',
    secondaryText: dark ? '#aeaeb2' : '#666666',
    tertiaryText: dark ? '#8e8e93' : '#999999',
    separator: dark ? '#38383a' : '#dddddd',
    border: dark ? '#38383a' : '#cccccc',
    fill: dark ? '#2c2c2e' : '#f0f0f0',
    button: dark ? '#3a3a3c' : 'lightgray',
    highlight: dark ? '#1c3a57' : '#e6f3ff',
    unread: dark ? '#1c3a57' : '#ADD8E6',
    tabIndicator: dark ? '#0a84ff' : 'blue',
  };
};
