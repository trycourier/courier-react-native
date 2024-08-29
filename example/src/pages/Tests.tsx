import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, FlatList, Alert, TouchableOpacity } from 'react-native';
import { IntegrationTests } from '../IntegrationTests';
import { useNavigation } from '@react-navigation/native';

type TestItem = {
  name: string;
  promise: () => Promise<any>;
  runOrder: 'normal' | 'run at end' | 'skip';
};

type TestSection = {
  title: string;
  data: TestItem[];
};

const testSections: TestSection[] = [
  {
    title: 'Client — Management',
    data: [
      { name: 'new CourierClient', promise: () => IntegrationTests.testClient(), runOrder: 'normal' },
      { name: 'client.remove', promise: () => IntegrationTests.testRemoveClient(), runOrder: 'run at end' },
    ]
  },
  {
    title: 'Client — Token',
    data: [
      { name: 'client.tokens.putUserToken', promise: () => IntegrationTests.testPutToken(), runOrder: 'normal' },
      { name: 'client.tokens.deleteUserToken', promise: () => IntegrationTests.testDeleteToken(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Client — Brands',
    data: [
      { name: 'client.brands.getBrand', promise: () => IntegrationTests.testBrands(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Client — Inbox',
    data: [
      { name: 'client.inbox.getMessages', promise: () => IntegrationTests.testMessages(), runOrder: 'normal' },
      { name: 'client.inbox.getArchivedMessages', promise: () => IntegrationTests.testArchivedMessages(), runOrder: 'normal' },
      { name: 'client.inbox.getUnreadMessageCount', promise: () => IntegrationTests.testUnreadCount(), runOrder: 'normal' },
      { name: 'client.inbox.getMessageById', promise: () => IntegrationTests.testMessageById(), runOrder: 'normal' },
      { name: 'client.inbox.open', promise: () => IntegrationTests.openMessage(), runOrder: 'normal' },
      { name: 'client.inbox.click', promise: () => IntegrationTests.clickMessage(), runOrder: 'normal' },
      { name: 'client.inbox.read', promise: () => IntegrationTests.readMessage(), runOrder: 'normal' },
      { name: 'client.inbox.unread', promise: () => IntegrationTests.unreadMessage(), runOrder: 'normal' },
      { name: 'client.inbox.archive', promise: () => IntegrationTests.archiveMessage(), runOrder: 'normal' },
      { name: 'client.inbox.readAll', promise: () => IntegrationTests.readAllMessages(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Client — Preferences',
    data: [
      { name: 'client.preferences.getUserPreferences', promise: () => IntegrationTests.getUserPreferences(), runOrder: 'normal' },
      { name: 'client.preferences.getUserPreferenceTopic', promise: () => IntegrationTests.getUserPreferenceTopic(), runOrder: 'normal' },
      { name: 'client.preferences.putUserPreferenceTopic', promise: () => IntegrationTests.putUserPreferenceTopic(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Client — Tracking',
    data: [
      { name: 'client.tracking.postTrackingUrl', promise: () => IntegrationTests.testTracking(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Shared — Auth',
    data: [
      { name: 'Courier.shared.signIn', promise: () => IntegrationTests.testSignIn(), runOrder: 'normal' },
      { name: 'Courier.shared.addAuthenticationListener', promise: () => IntegrationTests.testAuthenticationListener(), runOrder: 'normal' },
      { name: 'Courier.shared.signOut', promise: () => IntegrationTests.testSignOut(), runOrder: 'run at end' },
    ]
  },
  {
    title: 'Shared — Push Notifications',
    data: [
      { name: 'Courier.shared.addPushNotificationListener', promise: () => IntegrationTests.testPushListener(), runOrder: 'normal' },
      { name: 'Courier.shared.removeAllPushNotificationListeners', promise: () => IntegrationTests.testRemoveAllPushNotificationListeners(), runOrder: 'skip' },
      { name: 'Courier.shared.setTokenForProvider', promise: () => IntegrationTests.testSetTokenForProvider(), runOrder: 'normal' },
      { name: 'Courier.shared.getTokenForProvider', promise: () => IntegrationTests.testGetTokenForProvider(), runOrder: 'normal' },
      { name: 'Courier.shared.getAllTokens', promise: () => IntegrationTests.testGetAllTokens(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Shared — Inbox',
    data: [
      { name: 'Courier.shared.setInboxPaginationLimit', promise: () => IntegrationTests.testInboxPaginationLimit(), runOrder: 'normal' },
      { name: 'Courier.shared.openInboxMessage', promise: () => IntegrationTests.testOpenMessage(), runOrder: 'normal' },
      { name: 'Courier.shared.clickInboxMessage', promise: () => IntegrationTests.testClickMessage(), runOrder: 'normal' },
      { name: 'Courier.shared.readInboxMessage', promise: () => IntegrationTests.testReadMessage(), runOrder: 'normal' },
      { name: 'Courier.shared.unreadInboxMessage', promise: () => IntegrationTests.testUnreadMessage(), runOrder: 'normal' },
      { name: 'Courier.shared.archiveInboxMessage', promise: () => IntegrationTests.testArchiveMessage(), runOrder: 'normal' },
      { name: 'Courier.shared.readAllInboxMessages', promise: () => IntegrationTests.testReadAllInboxMessages(), runOrder: 'normal' },
      { name: 'Courier.shared.addInboxListener', promise: () => IntegrationTests.testInboxListener(), runOrder: 'normal' },
      { name: 'Courier.shared.refreshInbox', promise: () => IntegrationTests.testRefreshInbox(), runOrder: 'normal' },
      { name: 'Courier.shared.fetchNextPageOfMessages', promise: () => IntegrationTests.testFetchNextPageOfMessages(), runOrder: 'normal' },
      { name: 'Courier.shared.removeAllInboxListeners', promise: () => IntegrationTests.testRemoveAllInboxListeners(), runOrder: 'skip' },
    ]
  },
  {
    title: 'Shared — Client',
    data: [
      { name: 'Courier.shared.client', promise: () => IntegrationTests.testSharedClient(), runOrder: 'normal' },
    ]
  },
  {
    title: 'Shortcuts',
    data: [
      { name: 'Courier.requestNotificationPermission', promise: () => IntegrationTests.testRequestPushNotificationPermission(), runOrder: 'normal' },
      { name: 'Courier.getNotificationPermissionStatus', promise: () => IntegrationTests.testGetNotificationPermissionStatus(), runOrder: 'normal' },
      { name: 'Courier.setIOSForegroundPresentationOptions', promise: () => IntegrationTests.testSetIOSForegroundPresentationOptions(), runOrder: 'normal' },
      { name: 'Courier.openSettingsForApp', promise: () => IntegrationTests.testOpenSettingsForApp(), runOrder: 'skip' },
    ]
  },
  {
    title: 'Send',
    data: [
      { name: 'Inbox message', promise: () => IntegrationTests.testSendInboxMessage(), runOrder: 'normal' },
      { name: 'APN Push Notification', promise: () => IntegrationTests.testSendAPNSMessage(), runOrder: 'normal' },
      { name: 'FCM Push Notification', promise: () => IntegrationTests.testSendFCMMessage(), runOrder: 'normal' },
    ]
  }
];

const TestItem = ({ item, onPress }: { item: { name: string; result?: unknown; status?: string; runOrder?: string }, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.testItem, item.status === 'running' && styles.runningTestItem]}>
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
        ) : item.status === 'skipped' ? (
          <Text style={styles.statusEmoji}>⚠️</Text>
        ) : (
          <Text style={styles.statusEmoji}>{item.status === 'success' ? '✅' : '❌'}</Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const Tests = () => {
  const navigation = useNavigation();
  const [testResults, setTestResults] = useState<Array<{ name: string; result?: unknown; status?: string; runOrder?: string }>>(
    testSections.flatMap(section => section.data.map(test => ({ name: test.name, runOrder: test.runOrder })))
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
    const normalTests = testSections.flatMap(section => section.data.filter(test => test.runOrder === 'normal'));
    const endTests = testSections.flatMap(section => section.data.filter(test => test.runOrder === 'run at end'));
    const skipTests = testSections.flatMap(section => section.data.filter(test => test.runOrder === 'skip'));
    
    for (const test of normalTests) {
      await runSingleTest(test);
    }
    
    for (const test of endTests) {
      await runSingleTest(test);
    }

    for (const test of skipTests) {
      setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, status: 'skipped' } : t));
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

  const onTestItemPress = (item: { name: string; result?: unknown; status?: string; runOrder?: string }) => {
    if (isRunning) return;
    Alert.alert(
      "Run Test",
      `Do you want to run the test "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            const testToRun = testSections.flatMap(section => section.data).find(test => test.name === item.name);
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
        data={testSections}
        renderItem={({ item: section }) => (
          <>
            <SectionHeader title={section.title} />
            {section.data.map((test) => (
              <TestItem
                key={test.name}
                item={testResults.find(r => r.name === test.name) || { name: test.name, runOrder: test.runOrder }}
                onPress={() => onTestItemPress({ name: test.name, runOrder: test.runOrder })}
              />
            ))}
          </>
        )}
        keyExtractor={(item) => item.title}
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
  runningTestItem: {
    backgroundColor: '#e6f3ff',
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
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  sectionHeaderText: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      default: 'monospace',
    }),
    fontWeight: 'bold',
    fontSize: 24,
    paddingTop: 20,
  },
});

export default Tests;
