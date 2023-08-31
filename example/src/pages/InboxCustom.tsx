import { useCourier } from '@trycourier/courier-react-native';
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { InboxMessage } from 'src/models/InboxMessage';

const InboxCustom = () => {

  const courier = useCourier({ 
    inbox: {
      paginationLimit: 100
    }
  });

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
      isRead ? courier.inbox?.unreadMessage(messageId) : courier.inbox?.readMessage(messageId);
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

    if (courier.inbox?.isLoading) {
      return <Text>Loading</Text>
    }

    if (courier.inbox?.error) {
      return <Text>{courier.inbox?.error}</Text>
    }

    return (
      <FlatList
        data={courier.inbox?.messages}
        keyExtractor={message => message.messageId}
        renderItem={message => <ListItem message={message.item} />}
        refreshControl={
          <RefreshControl
            refreshing={courier.inbox?.isRefreshing ?? false}
            onRefresh={courier.inbox?.refresh}
          />
        }
        ListFooterComponent={() => {
          return courier.inbox?.canPaginate ? <PaginationItem /> : null
        }}
        onEndReached={() => {
          if (courier.inbox?.canPaginate) {
            courier.inbox?.fetchNextPageOfMessages()
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