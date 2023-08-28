import Courier from '@trycourier/courier-react-native';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { InboxMessage } from 'src/models/InboxMessage';

const InboxCustom = () => {

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    
    const listener = Courier.shared.addInboxListener({
      onInitialLoad: () => {
        setIsLoading(true)
      },
      onError: (error) => {
        setIsLoading(false)
        setError(error)
      },
      onMessagesChanged: (messages) => {
        setIsLoading(false)
        setMessages(messages)
      }
    })

    return () => {
      listener.remove()
    }

  }, []);

  const onRefresh = async () => {

    setRefreshing(true);
    
    await Courier.shared.refreshInbox();

    setRefreshing(false);

  }

  const ListItem = (props: { message: InboxMessage }) => {

    const styles = StyleSheet.create({
      container: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      unread: {
        backgroundColor: 'red'
      },
      text: {
        fontFamily: 'Menlo',
        lineHeight: 22,
        fontSize: 16,
      },
    });

    const isRead = props.message.read;

    function toggleMessage() {
      const messageId = props.message.messageId;
      isRead ? Courier.shared.unreadMessage({ messageId }) : Courier.shared.readMessage({ messageId });
    }

    return (
      <TouchableOpacity style={[styles.container, isRead ? undefined : styles.unread]} onPress={toggleMessage}>
        <Text style={styles.text}>{JSON.stringify(props.message, null, 2)}</Text>
      </TouchableOpacity>
    );

  };

  function buildContent() {

    if (isLoading) {
      return <Text>Loading</Text>
    }

    if (error) {
      return <Text>{error}</Text>
    }

    return (
      <FlatList
        data={messages}
        keyExtractor={message => message.messageId}
        renderItem={message => <ListItem message={message.item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    )

  }
  
  return (
    <View>
      {buildContent()}
    </View>
  );

};

export default InboxCustom;