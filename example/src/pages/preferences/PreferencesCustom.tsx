import Courier, { CourierUserPreferencesTopic } from "@trycourier/courier-react-native";
import { addListener } from "../../Emitter";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ListItem = (props: { topic: CourierUserPreferencesTopic, onClick: () => void }) => {

  const SCREEN_WIDTH = Dimensions.get("screen").width;

  const styles = StyleSheet.create({
    container: {
      width: SCREEN_WIDTH,
    },
    text: {
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        default: 'monospace',
      }),
      fontSize: 16,
    }
  });
  
  return (
    <TouchableOpacity style={styles.container} onPress={props.onClick}>
      <View style={{ padding: 16 }}>
        <Text style={styles.text}>{JSON.stringify(props.topic, null, 2)}</Text>
      </View>
    </TouchableOpacity>
  );

}

const PreferencesCustom = ({ navigation }: any) => {

  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [topics, setTopics] = useState<CourierUserPreferencesTopic[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const initUser = async () => {
      const id = await Courier.shared.getUserId();
      setUserId(id);
    };

    initUser();

    const handleSaveClicked = (_: any) => {
      if (userId) {
        getPrefs();
      }
    };

    // Add listener when component mounts
    addListener('saveButtonClicked', handleSaveClicked);

  }, []);

  useEffect(() => {

    if (userId) {
      getPrefs();
    }

  }, [userId]);

  async function getPrefs(refresh: boolean = false) {

    const client = await Courier.shared.getClient();

    if (!client) {
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {

      console.log('getPrefs');

      const res = await client.preferences.getUserPreferences();
      setTopics(res.items);

    } catch (e) {

      console.log(e);

    }

    if (refresh) {
      setIsRefreshing(false);
    } else {
      setIsLoading(false);
    }

  }

  const onItemClick = (topic: CourierUserPreferencesTopic) => {
    navigation.push('PreferencesDetail', { id: topic.topicId });
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
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => getPrefs(true)} />}
        />
      )}

    </View>
  );

};

export default PreferencesCustom;