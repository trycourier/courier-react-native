import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, FlatList, Alert, TouchableOpacity } from 'react-native';
import { IntegrationTests } from '../IntegrationTests';
import { useNavigation } from '@react-navigation/native';

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
  { name: 'Shared — Send Inbox Message', promise: () => IntegrationTests.testSendInboxMessage() },
  { name: 'Shared — Send APNS Message', promise: () => IntegrationTests.testSendAPNSMessage() },
  { name: 'Shared — Send FCM Message', promise: () => IntegrationTests.testSendFCMMessage() },
];

const TestItem = ({ item, onPress }: { item: { name: string; result?: unknown; status?: string }, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.testItem}>
      <View style={styles.testItemContent}>
        <Text style={styles.testItemTitle}>{item.name}</Text>
        {item.status !== undefined && item.status !== 'running' && (
          <Text style={styles.testItemResult}>
            {JSON.stringify(item.result ?? 'No result', null, 2)}
          </Text>
        )}
      </View>
      <View style={styles.testItemStatus}>
        {item.status === undefined ? (
          <Text style={styles.statusEmoji}>🧪</Text>
        ) : item.status === 'running' ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.statusEmoji}>{item.status === 'success' ? '✅' : '❌'}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const Tests = () => {
  const navigation = useNavigation();
  const [testResults, setTestResults] = useState<Array<{ name: string; result?: unknown; status?: string }>>(
    tests.map(test => ({ name: test.name }))
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={runAllTests} disabled={isRunning}>
          <Text style={[styles.runTestsButton, isRunning && styles.disabledButton]}>Run Tests</Text>
        </TouchableOpacity>
      ),
    });
  }, [isRunning]);

  const handleTestError = (error: unknown) => {
    let errorMessage = 'An unknown error occurred';
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
      };
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = String(error);
      errorDetails = { ...error };
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return { errorMessage, errorDetails };
  };

  const runAllTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    for (const test of tests) {
      await runSingleTest(test);
    }
    setIsRunning(false);
  };

  const runSingleTest = async (test: TestItem) => {
    setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, status: 'running', result: undefined } : t));
    
    try {
      const result = await test.promise();
      setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, result, status: 'success' } : t));
    } catch (error) {
      const { errorMessage, errorDetails } = handleTestError(error);

      console.log('Test failed:', {
        testName: test.name,
        errorMessage,
        errorDetails,
      });

      setTestResults(prev => prev.map(t => 
        t.name === test.name 
          ? { 
              ...t, 
              result: {
                errorMessage,
                errorDetails,
              },
              status: 'failure' 
            } 
          : t
      ));
    }
  };

  const onTestItemPress = (item: { name: string; result?: unknown; status?: string }) => {
    if (isRunning) return;
    Alert.alert(
      "Run Test",
      `Do you want to run the test "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            const testToRun = tests.find(test => test.name === item.name);
            if (testToRun) {
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
        data={testResults}
        renderItem={({ item }) => <TestItem item={item} onPress={() => onTestItemPress(item)} />}
        keyExtractor={(item) => item.name}
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
  runTestsButton: {
    fontSize: 16,
    color: 'blue',
    marginRight: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Tests;
