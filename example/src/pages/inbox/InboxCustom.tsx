import Courier from '@trycourier/courier-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { InboxMessage } from 'src/models/InboxMessage';

const InboxCustom = () => {

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inbox, setInbox] = useState<any>({});

  useEffect(() => {

    Courier.shared.setInboxPaginationLimit({ limit: 100 });

    const inboxListener = Courier.shared.addInboxListener({
      onInitialLoad() {
        setIsLoading(true);
      },
      onError(error) {
        setIsLoading(false);
        setError(error);
      },
      onMessagesChanged(messages, unreadMessageCount, totalMessageCount, canPaginate) {
        setIsLoading(false);
        setError(null);
        setInbox({
          messages,
          unreadMessageCount,
          totalMessageCount,
          canPaginate
        });
      },
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
        fontFamily: 'Menlo',
        lineHeight: 22,
        fontSize: 16,
      },
    });

    const isRead = props.message.read;

    function toggleMessage() {
      const messageId = props.message.messageId;
      Courier.shared.clickMessage({ messageId: messageId });
      const message = isRead ? Courier.shared.unreadMessage({ messageId: messageId }) : Courier.shared.readMessage({ messageId: messageId });
      console.log(message);
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
        data={inbox?.messages}
        keyExtractor={message => message.messageId}
        renderItem={message => <ListItem message={message.item} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
          />
        }
        ListFooterComponent={() => {
          return inbox?.canPaginate ? <PaginationItem /> : null
        }}
        onEndReached={() => {
          if (inbox?.canPaginate) {
            Courier.shared.fetchNextPageOfMessages();
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