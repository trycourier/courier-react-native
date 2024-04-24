import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Courier, { CourierUserPreferencesChannel, CourierUserPreferencesStatus } from "@trycourier/courier-react-native";
import { emitEvent } from "../../Emitter";
import Toast from 'react-native-toast-message';

const PreferencesDetail = ({ route, navigation }: any) => {

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    switchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    text: {
      fontFamily: 'monospace'
    },
    section: {
      marginBottom: 20,
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 8,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const statuses = [
    { status: CourierUserPreferencesStatus.OptedIn, name: "OPTED_IN" },
    { status: CourierUserPreferencesStatus.OptedOut, name: "OPTED_OUT" },
    { status: CourierUserPreferencesStatus.Required, name: "REQUIRED" }
  ];

  const { id } = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [useCustomRouting, setUseCustomRouting] = useState(false);
  const [routingChannels, setRoutingChannels] = useState<CourierUserPreferencesChannel[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: id,
    });
    getTopic(id);
  }, []);

  async function getTopic(topicId: string) {
    setIsLoading(true);
    try {
      const topic = await Courier.shared.getUserPreferencesTopic({ topicId });
      setStatusIndex(statuses.findIndex(status => status.status === topic.status) || 0);
      setUseCustomRouting(topic.hasCustomRouting || false);
      setRoutingChannels(topic.customRouting || []);
    } catch (error) {
      console.error("Error fetching topic:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePreferences() {
    setIsLoading(true);
    try {

      await Courier.shared.putUserPreferencesTopic({
        topicId: id,
        status: statuses[statusIndex]?.status || CourierUserPreferencesStatus.OptedIn,
        hasCustomRouting: useCustomRouting,
        customRouting: routingChannels,
      });

      emitEvent('saveButtonClicked', {});

      navigation.goBack();
      
    } catch (error) {

      console.error("Error saving preferences:", error);

      Toast.show({
        type: 'error',
        text1: `${error}`,
        text2: `${error}`,
      });
      
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.title}>Status</Text>
            <SegmentedControl
              values={statuses.map(status => status.name)}
              selectedIndex={statusIndex}
              fontStyle={styles.text}
              onChange={({ nativeEvent }) => setStatusIndex(nativeEvent.selectedSegmentIndex)}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Use Custom Routing</Text>
            <View style={styles.switchItem}>
              <Text style={styles.text}>Use Custom Routing</Text>
              <Switch
                value={useCustomRouting}
                onValueChange={value => {
                  setUseCustomRouting(value)
                }}
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.title}>Routing Channels</Text>
            {Object.values(CourierUserPreferencesChannel).map(channel => (
              <View key={channel} style={styles.switchItem}>
                <Text style={styles.text}>{channel}</Text>
                <Switch
                  value={routingChannels.includes(channel)}
                  onValueChange={value => {
                    setRoutingChannels(prevChannels => value
                      ? [...prevChannels, channel]
                      : prevChannels.filter(c => c !== channel)
                    );
                  }}
                />
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Button onPress={() => savePreferences()} title="Save" />
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default PreferencesDetail;
