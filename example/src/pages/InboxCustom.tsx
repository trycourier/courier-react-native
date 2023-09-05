import { useCourierInbox } from '@trycourier/courier-react-native';
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { InboxMessage } from 'src/models/InboxMessage';

const InboxCustom = () => {

  const inbox = useCourierInbox({
    paginationLimit: 100
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
      isRead ? inbox?.unreadMessage(messageId) : inbox?.readMessage(messageId);
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

    if (inbox?.isLoading) {
      return <Text>Loading</Text>
    }

    if (inbox?.error) {
      return <Text>{inbox?.error}</Text>
    }

    return (
      <FlatList
        data={inbox?.messages}
        keyExtractor={message => message.messageId}
        renderItem={message => <ListItem message={message.item} />}
        refreshControl={
          <RefreshControl
            refreshing={inbox?.isRefreshing ?? false}
            onRefresh={inbox?.refresh}
          />
        }
        ListFooterComponent={() => {
          return inbox?.canPaginate ? <PaginationItem /> : null
        }}
        onEndReached={() => {
          if (inbox?.canPaginate) {
            inbox?.fetchNextPageOfMessages()
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