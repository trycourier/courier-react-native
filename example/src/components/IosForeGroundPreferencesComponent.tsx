import { View, Platform, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

import * as CourierPush from '@trycourier/courier-react-native';

export type IosForeGroundNotificationPreferencesType =
  | 'sound'
  | 'badge'
  | 'list'
  | 'banner';

const allIOSPreferences: IosForeGroundNotificationPreferencesType[] = [
  'sound',
  'list',
  'badge',
  'banner',
];

const IosForeGroundPreferencesComponent = () => {
  const [iosNotificationPreferences, setIosNotificationPreferences] = useState<
    IosForeGroundNotificationPreferencesType[]
  >(['badge', 'banner', 'list', 'sound']);

  const handleIosPreferencesNotificationCheckbox = (
    option: IosForeGroundNotificationPreferencesType
  ) => {
    let updatedIosNotificationPreferences: IosForeGroundNotificationPreferencesType[];
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
    CourierPush.iOSForegroundPresentationOptions({
      options: updatedIosNotificationPreferences,
    });
    setIosNotificationPreferences(updatedIosNotificationPreferences);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      CourierPush.iOSForegroundPresentationOptions({
        options: iosNotificationPreferences,
      });
    }
    // eslint-disable-next-line
  }, []);

  if (Platform.OS !== 'ios') return null;
  return (
    <View style={styles.overAll}>
      {allIOSPreferences.map((item) => (
        <View style={styles.boxContainer} key={item}>
          <BouncyCheckbox
            text={item}
            isChecked={iosNotificationPreferences.includes(item)}
            onPress={() => handleIosPreferencesNotificationCheckbox(item)}
            textStyle={styles.textStyle}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overAll: {
    flexDirection: 'row',
    backgroundColor: 'black',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  boxContainer: {
    margin: 8,
  },
  textStyle: { color: 'white' },
});

export default IosForeGroundPreferencesComponent;
