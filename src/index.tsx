import {
  requireNativeComponent,
  UIManager,
  Platform,
  type ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package 'courier-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type CourierReactNativeProps = {
  color: string;
  style: ViewStyle;
};

const ComponentName = 'CourierReactNativeView';

export const CourierReactNativeView =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<CourierReactNativeProps>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };
