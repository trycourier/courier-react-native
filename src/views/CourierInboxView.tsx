import { Platform, requireNativeComponent, UIManager, ViewStyle } from "react-native";
import CourierInboxTheme from "src/models/CourierInboxTheme";

type CourierInboxViewProps = {
  lightTheme?: CourierInboxTheme;
  darkTheme?: CourierInboxTheme;
  style?: ViewStyle;
};

const ComponentName = 'CourierReactNativeView';

const LINKING_ERROR =
  `The package 'courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const CourierInboxView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<CourierInboxViewProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };