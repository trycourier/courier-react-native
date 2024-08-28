import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, RefreshControl, FlatList, Alert, TouchableOpacity } from 'react-native';
import { IntegrationTests } from '../IntegrationTests';

type TestItem = {
  name: string;
  promise: () => Promise<any>;
};

const tests: TestItem[] = [
  { name: 'Client — Setup', promise: () => IntegrationTests.testClient() },
  { name: 'Client — Token Updates', promise: () => IntegrationTests.testTokens() },
  { name: 'Client — Get Brand', promise: () => IntegrationTests.testBrands() },
  { name: 'Client — Inbox Messages', promise: () => IntegrationTests.testMessages() },
  { name: 'Client — Inbox Archived Messages', promise: () => IntegrationTests.testArchivedMessages() },
  { name: 'Client — Inbox Unread Count', promise: () => IntegrationTests.testUnreadCount() },
  { name: 'Client — Inbox Message By Id', promise: () => IntegrationTests.testMessageById() },
  { name: 'Client — Inbox Open Message', promise: () => IntegrationTests.openMessage() },
  { name: 'Client — Inbox Click Message', promise: () => IntegrationTests.clickMessage() },
  { name: 'Client — Inbox Read Message', promise: () => IntegrationTests.readMessage() },
  { name: 'Client — Inbox Unread Message', promise: () => IntegrationTests.unreadMessage() },
  { name: 'Client — Inbox Archive Message', promise: () => IntegrationTests.archiveMessage() },
  { name: 'Client — Inbox Read All Messages', promise: () => IntegrationTests.readAllMessages() },
  { name: 'Client — Get User Preferences', promise: () => IntegrationTests.getUserPreferences() },
  { name: 'Client — Get User Preference Topic', promise: () => IntegrationTests.getUserPreferenceTopic() },
  { name: 'Client — Update User Preference Topic', promise: () => IntegrationTests.putUserPreferenceTopic() },
  { name: 'Client — Test Tracking', promise: () => IntegrationTests.testTracking() },
  { name: 'Client — Remove Client', promise: () => IntegrationTests.testRemoveClient() },
  { name: 'Shared — Sign In', promise: () => IntegrationTests.testSignIn() },
  { name: 'Shared — Authentication Listener', promise: () => IntegrationTests.testAuthenticationListener() },
  { name: 'Shared — Get Shared Client', promise: () => IntegrationTests.testSharedClient() },
  { name: 'Shared — Push Notification Listener', promise: () => IntegrationTests.testPushListener() },
  { name: 'Shared — Remove Push Listener', promise: () => IntegrationTests.testRemovePushListener() },
  { name: 'Shared — Set Token For Provider', promise: () => IntegrationTests.testSetTokenForProvider() },
  { name: 'Shared — Get Token For Provider', promise: () => IntegrationTests.testGetTokenForProvider() },
  { name: 'Shared — Get All Tokens', promise: () => IntegrationTests.testGetAllTokens() },
  { name: 'Shared — Set Inbox Pagination Limit', promise: () => IntegrationTests.testInboxPaginationLimit() },
  { name: 'Shared — Open Message', promise: () => IntegrationTests.testOpenMessage() },
  { name: 'Shared — Click Message', promise: () => IntegrationTests.testClickMessage() },
  { name: 'Shared — Read Message', promise: () => IntegrationTests.testReadMessage() },
  { name: 'Shared — Unread Message', promise: () => IntegrationTests.testUnreadMessage() },
  { name: 'Shared — Archive Message', promise: () => IntegrationTests.testArchiveMessage() },
  { name: 'Shared — Read All Inbox Messages', promise: () => IntegrationTests.testReadAllInboxMessages() },
  { name: 'Shared — Inbox Listener', promise: () => IntegrationTests.testInboxListener() },
  { name: 'Shared — Remove All Inbox Listeners', promise: () => IntegrationTests.testRemoveAllInboxListeners() },
  { name: 'Shared — Sign Out', promise: () => IntegrationTests.testSignOut() },
];

const TestItem = ({ item, onPress }: { item: { name: string; result?: unknown; status?: string }, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.testItem}>
      <View style={styles.testItemContent}>
        <Text style={styles.testItemTitle}>{item.name}</Text>
        {item.status !== undefined && (
          <Text style={styles.testItemResult}>
            {JSON.stringify(item.result ?? 'No result', null, 2)}
          </Text>
        )}
      </View>
      <View style={styles.testItemStatus}>
        {item.status === undefined ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.statusEmoji}>{item.status === 'success' ? '✅' : '❌'}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const Tests = () => {
  
  const [completedTests, setCompletedTests] = useState<Array<{ name: string; result?: unknown; status?: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRefreshing(false);
    setCompletedTests([]);
    for (const test of tests) {
      await runSingleTest(test);
    }
    setIsRunning(false);
  };

  const runSingleTest = async (test: TestItem) => {
    setCompletedTests(prev => [{ name: test.name }, ...prev]);
    
    try {
      const result = await test.promise();
      setCompletedTests(prev => [
        { name: test.name, result, status: 'success' },
        ...prev.slice(1)
      ]);
    } catch (error) {
      console.log(error);
      setCompletedTests(prev => [
        { name: test.name, result: `${error}`, status: 'failure' },
        ...prev.slice(1)
      ]);
    }
  };

  const onRefresh = () => {
    if (!isRunning) {
      setRefreshing(true);
      runTests();
    }
  };

  const onTestItemPress = (item: { name: string; result?: unknown; status?: string }) => {
    Alert.alert(
      "Rerun Test",
      `Do you want to rerun the test "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            const testToRun = tests.find(test => test.name === item.name);
            if (testToRun) {
              setCompletedTests(prev => prev.map(t => t.name === item.name ? { name: item.name } : t));
              await runSingleTest(testToRun);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={completedTests}
        renderItem={({ item }) => <TestItem item={item} onPress={() => onTestItemPress(item)} />}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  testItemContent: {
    flex: 1,
    marginRight: 10,
  },
  testItemTitle: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testItemStatus: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testItemResult: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
  },
  statusEmoji: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Tests;
