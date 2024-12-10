import Courier, { InboxMessage } from '@trycourier/courier-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';

const InboxCustom = () => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [canPaginate, setCanPaginate] = useState(false);

  useEffect(() => {

    Courier.shared.inboxPaginationLimit = 100;

    const inboxListener = Courier.shared.addInboxListener({
      onInitialLoad() {
        setIsLoading(true);
      },
      onError(error) {
        setIsLoading(false);
        setError(error);
      },
      onFeedChanged(messageSet) {
        setIsLoading(false);
        setError(null);
        setMessages(messageSet.messages);
        setCanPaginate(messageSet.canPaginate);
      },
      onMessageChanged(feed, index, message) {
        if (feed === 'feed') {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[index] = message;
            return newMessages;
          });
        }
      },
      onMessageAdded(feed, index, message) {
        if (feed === 'feed') {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages.splice(index, 0, message);
            return newMessages;
          });
        }
      },
      onMessageRemoved(feed, index) {
        if (feed === 'feed') {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages.splice(index, 1);
            return newMessages;
          });
        }
      },
      onPageAdded(feed, messageSet) {
        if (feed === 'feed') {
          setMessages(prevMessages => [...prevMessages, ...messageSet.messages]);
          setCanPaginate(messageSet.canPaginate);
        }
      }
    });

    return () => {
      inboxListener.remove();
    };

  }, []);

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
        width: Platform.OS === 'ios' ? undefined : '100%',
        fontFamily: Platform.select({
          ios: 'Courier',
          android: 'monospace',
          default: 'monospace',
        }),
        fontSize: 16,
      },
    });

    const isRead = props.message.read;

    async function toggleMessage() {
      const messageId = props.message.messageId;
      await Courier.shared.clickMessage({ messageId: messageId });
      isRead ? await Courier.shared.unreadMessage({ messageId: messageId }) : await Courier.shared.readMessage({ messageId: messageId });
      console.log(props.message);
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

  const refresh = async () => {

    setIsRefreshing(true);

    await Courier.shared.refreshInbox();

    setIsRefreshing(false);

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
            onRefresh={refresh}
          />
        }
        ListFooterComponent={() => {
          return canPaginate ? <PaginationItem /> : null
        }}
        onEndReached={() => {
          if (canPaginate) {
            Courier.shared.fetchNextPageOfMessages({ inboxMessageFeed: 'feed' });
          }
        }}
      />
    )

  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  return (
    <View style={styles.container}>
      {buildContent()}
    </View>
  );

};

export default InboxCustom;