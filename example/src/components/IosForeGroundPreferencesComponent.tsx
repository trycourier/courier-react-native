import { View, Platform, StyleSheet, Text } from 'react-native';
import React, { useState } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import Courier from '@trycourier/courier-react-native';

export type IosForegroundNotificationPreferencesType =
  | 'sound'
  | 'badge'
  | 'list'
  | 'banner';

const allIOSPreferences: IosForegroundNotificationPreferencesType[] = [
  'sound',
  'list',
  'badge',
  'banner',
];

const IosForeGroundPreferencesComponent = () => {
  const [iosNotificationPreferences, setIosNotificationPreferences] = useState<
    IosForegroundNotificationPreferencesType[]
  >(['badge', 'banner', 'list', 'sound']);

  const handleIosPreferencesNotificationCheckbox = (
    option: IosForegroundNotificationPreferencesType
  ) => {
    let updatedIosNotificationPreferences: IosForegroundNotificationPreferencesType[];
    if (iosNotificationPreferences.includes(option)) {
      updatedIosNotificationPreferences = iosNotificationPreferences.filter(
        (item) => item !== option
      );
    } else {
      updatedIosNotificationPreferences = [
        ...iosNotificationPreferences,
        option,
      ];
    }
    Courier.iOSForegroundPresentationOptions({
      options: updatedIosNotificationPreferences,
    });
    setIosNotificationPreferences(updatedIosNotificationPreferences);
  };

  if (Platform.OS !== 'ios') return null;

  return (
    <View style={styles.overAll}>
      <Text>{'iOS Foreground Notification Presentation Styles'}</Text>
      {allIOSPreferences.map((item) => (
        <View style={styles.boxContainer} key={item}>
          <BouncyCheckbox
            text={item}
            isChecked={iosNotificationPreferences.includes(item)}
            onPress={() => handleIosPreferencesNotificationCheckbox(item)}
          />
        </View>
      ))}
    </View>
  );
  
};

const styles = StyleSheet.create({
  overAll: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  boxContainer: {
    margin: 8,
  },
});

export default IosForeGroundPreferencesComponent;
