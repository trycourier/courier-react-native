import Courier from '@trycourier/courier-react-native';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { InboxMessage } from 'src/models/InboxMessage';

const InboxCustom = () => {

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [isRefreshing, setRefreshing] = useState(false);
  const [canPaginate, setCanPaginate] = useState(false);

  React.useEffect(() => {

    Courier.shared.setInboxPaginationLimit({ limit: 100 });
    
    const listener = Courier.shared.addInboxListener({
      onInitialLoad: () => {
        setIsLoading(true);
      },
      onError: (error) => {
        setIsLoading(false);
        setError(error);
      },
      onMessagesChanged: async (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
        setCanPaginate(canPaginate);
        setIsLoading(false);
        setMessages(messages);
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

  const PaginationItem = () => {

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" />
      </View>
    );

  }

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
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
        ListFooterComponent={() => {
          return canPaginate ? <PaginationItem /> : null
        }}
        onEndReached={() => {
          if (canPaginate) {
            Courier.shared.fetchNextPageOfMessages()
          }
        }}
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