import Courier, { CourierUserPreferencesChannel, CourierUserPreferencesStatus } from "@trycourier/courier-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CourierUserPreferencesTopic } from "src/models/CourierUserPreferencesTopic";

const ListItem = (props: { topic: CourierUserPreferencesTopic, onClick: () => void }) => (
  <TouchableOpacity onPress={props.onClick}>
    <View style={{ padding: 16 }}>
      <Text>{JSON.stringify(props.topic, null, 2)}</Text>
    </View>
  </TouchableOpacity>
);


const Preferences = () => {

  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [topics, setTopics] = useState<CourierUserPreferencesTopic[]>([])

  useEffect(() => {

    setUserId(Courier.shared.userId)

  }, []);

  useEffect(() => {

    if (userId) {
      getPrefs()
    }

  }, [userId]);

  async function getPrefs() {

    setIsLoading(true);

    try {

      const preferences = await Courier.shared.getUserPreferences();
      setTopics(preferences.items ?? []);

    } catch (e) {

      console.log(e);

    }

    setIsLoading(false);

  }

  function getRandomChannels() {

    const channelValues = [
      CourierUserPreferencesChannel.DirectMessage,
      CourierUserPreferencesChannel.Email,
      CourierUserPreferencesChannel.Push,
      CourierUserPreferencesChannel.SMS,
      CourierUserPreferencesChannel.Webhook,
    ];
  
    const random = () => Math.floor(Math.random() * channelValues.length);
    const randomCount = random();
    const randomChannels: CourierUserPreferencesChannel[] = [];
  
    while (randomChannels.length < randomCount) {
      const randomIndex = random();
      const randomChannel = channelValues[randomIndex];
  
      if (randomChannel && !randomChannels.includes(randomChannel)) {
        randomChannels.push(randomChannel);
      }
    }
  
    return randomChannels;
  }

  const onItemClick = async (item: CourierUserPreferencesTopic) => {

    try {

      const topic = await Courier.shared.getUserPreferencesTopic({ 
        topicId: item.topicId ?? 'empty'
      });
  
      console.log(topic);
  
      await Courier.shared.putUserPreferencesTopic({
        topicId: topic.topicId ?? 'empty',
        status: CourierUserPreferencesStatus.OptedOut,
        hasCustomRouting: true,
        customRouting: getRandomChannels(),
      });
  
      getPrefs();

    } catch (e: any) {

      console.error(e);
      Alert.alert('Error Updating Preference', e.toString());

    }

  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      marginBottom: 10,
    },
  });
  
  return (
    <View style={styles.container}>

      {isLoading && (
        <ActivityIndicator size="small" />
      )}

      {!isLoading && (
        <FlatList
          data={topics}
          renderItem={({ item }) => <ListItem topic={item} onClick={() => onItemClick(item)} />}
          keyExtractor={(item) => item.topicId ?? 'empty'}
        />
      )}

    </View>
  );

};

export default Preferences;