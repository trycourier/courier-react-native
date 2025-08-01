import Courier, { InboxMessage, InboxMessageEvent } from '@trycourier/courier-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { InboxMessageFeed } from 'src/models/InboxMessageFeed';

const InboxCustom = () => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [canPaginate, setCanPaginate] = useState(false);

  useEffect(() => {
    const initInbox = async () => {
      const inboxListener = await Courier.shared.addInboxListener({
        onLoading(isRefresh: boolean) {
          if (isRefresh) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }
        },
        onError(error: string) {
          setIsLoading(false);
          setError(error);
        },
        onMessagesChanged(messages: InboxMessage[], canPaginate: boolean, feed: InboxMessageFeed) {
          if (feed === 'feed') {
            setIsLoading(false);
            setError(null);
            setMessages(messages);
            setCanPaginate(canPaginate);
          }
        },
        onMessageEvent(message: InboxMessage, index: number, feed: InboxMessageFeed, eventName: InboxMessageEvent) {
          if (feed === 'feed') {
            console.log(message, index, feed, eventName);
            setMessages([...messages]);
          }
        },
        onPageAdded(messages: InboxMessage[], canPaginate: boolean, isFirstPage: boolean, feed: string) {
          if (feed === 'feed' && !isFirstPage) {
            setMessages(prevMessages => [...prevMessages, ...messages]);
            setCanPaginate(canPaginate);
          }
        }
      });

      return inboxListener;
    };

    let inboxListener: any;
    initInbox().then(listener => {
      inboxListener = listener;
    });

    return () => {
      if (inboxListener) {
        inboxListener.remove();
      }
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
        backgroundColor: '#ADD8E6'
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
            Courier.shared.fetchNextPageOfMessages({ inboxMessageFeed: 'feed' }).then(messages => {
              console.log(messages.length);
            });
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