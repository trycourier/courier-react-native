import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, FlatList, Alert, TouchableOpacity, TextInput, Modal, Button, Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { IntegrationTests } from '../IntegrationTests';
import { useNavigation } from '@react-navigation/native';
import { CourierClient } from '@trycourier/courier-react-native';
import Env from '../Env';
import { ExampleServer, Utils } from '../Utils';

let savedClient: CourierClient | undefined = undefined;

const ExampleIntegrationTests: Record<string, (params: any) => Promise<any>> = {
  
  createClient: async (params: { userId: string, clientKey: string, showLogs: boolean, tenantId?: string, connectionId?: string }) => {
    
    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: params.userId,
    });

    savedClient = new CourierClient({
      userId: params.userId,
      showLogs: params.showLogs,
      jwt: token,
      clientKey: params.clientKey,
      tenantId: params.tenantId,
      connectionId: params.connectionId,
    });

    return {
      id: savedClient.clientId,
      options: savedClient.options,
    };

  },

  removeClient: async (params: { clientId?: string }) => {

    let id = params.clientId;

    if (savedClient) {
      id = savedClient.clientId;
      savedClient.remove();
      savedClient = undefined;
    }
    return {
      clientId: id,
    };

  },

  // testPutToken: async (params: { token: string, provider: string }) => {
  //   if (!savedClient) {
  //     throw new Error("Client not initialized. Run testClient first.");
  //   }
  //   // Using the saved client to put token
  //   await savedClient.tokens.putUserToken([]);
  //   return { token: params.token, provider: params.provider };
  // },

  // testDeleteToken: async (params: { provider: string }) => {
  //   if (!savedClient) {
  //     throw new Error("Client not initialized. Run testClient first.");
  //   }
  //   // Using the saved client to delete token
  //   await savedClient.deleteToken(params.provider);
  //   return { deletedProvider: params.provider };
  // },

  // testBrands: async (params: { brandId: string }) => {
  //   if (!savedClient) {
  //     throw new Error("Client not initialized. Run testClient first.");
  //   }
  //   // Using the saved client to fetch brand
  //   const brand = await savedClient.getBrand(params.brandId);
  //   return brand;
  // }
};

type TestItem = {
  name: string;
  testId: string;
  defaultParams: Record<string, string | boolean | undefined>;
  runOrder: 'normal' | 'run at end' | 'skip';
};

type TestSection = {
  title: string;
  tests: TestItem[];
};

const getTestSections = (): TestSection[] => [
  {
    title: 'Client — Management',
    tests: [
      {
        name: 'new CourierClient',
        testId: 'createClient',
        defaultParams: { userId: Utils.generateUUID(), clientKey: Env.clientKey, showLogs: true, tenantId: undefined, connectionId: undefined },
        runOrder: 'normal'
      },
      {
        name: 'remove CourierClient',
        testId: 'removeClient',
        defaultParams: { clientId: savedClient?.clientId },
        runOrder: 'run at end'
      },
      // { name: 'client.remove', testId: 'testRemoveClient', defaultParams: {}, runOrder: 'run at end' },
    ]
  },
  // Other test sections...
];

const TestItem = ({ item, onPress }: { item: { name: string; result?: unknown; status?: string; runOrder?: string }, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.testItem, item.status === 'running' && styles.runningTestItem]}>
      <View style={styles.testItemContent}>
        <Text style={styles.testItemTitle}>{item.name}</Text>
        {item.status !== undefined && item.status !== 'running' && (
          <Text style={styles.testItemResult}>
            {item.result ? JSON.stringify(item.result, null, 2) : 'No Response'}
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
  const testSections = getTestSections();
  const [testResults, setTestResults] = useState<Array<{ name: string; result?: unknown; status?: string; runOrder?: string }>>(
    testSections.flatMap(section => section.tests.map(test => ({ name: test.name, runOrder: test.runOrder })))
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
    const normalTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'normal'));
    const endTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'run at end'));
    const skipTests = testSections.flatMap(section => section.tests.filter(test => test.runOrder === 'skip'));
    
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
      const testFunction = ExampleIntegrationTests[test.testId];
      if (typeof testFunction === 'function') {
        const result = await testFunction(test.defaultParams);
        setTestResults(prev => prev.map(t => t.name === test.name ? { ...t, result, status: 'success' } : t));
      } else {
        throw new Error(`Test function '${test.testId}' not found`);
      }
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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [testParams, setTestParams] = useState<Record<string, string | boolean | undefined>>({});

  const onTestItemPress = (item: TestItem) => {
    if (isRunning) return;
    
    setSelectedTest(item);
    setTestParams({ ...item.defaultParams });
    setModalVisible(true);
  };

  const handleParamChange = (key: string, value: string | boolean | undefined) => {
    setTestParams(prev => ({ ...prev, [key]: value }));
  };

  const handleRunTest = async () => {
    if (selectedTest) {
      const testToRun = { ...selectedTest, defaultParams: testParams };
      await runSingleTest(testToRun);
    }
    setModalVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedTest(null);
    setTestParams({});
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={testSections}
        renderItem={({ item: section }) => (
          <>
            <SectionHeader title={section.title} />
            {section.tests.map((test) => (
              <TestItem
                key={test.name}
                item={testResults.find(r => r.name === test.name) || { name: test.name, runOrder: test.runOrder }}
                onPress={() => onTestItemPress(test)}
              />
            ))}
          </>
        )}
        keyExtractor={(item) => item.title}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Run Test: {selectedTest?.name}</Text>
              {Object.entries(testParams).map(([key, value]) => (
                <View key={key} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{key}:</Text>
                  {typeof value === 'boolean' ? (
                    <Switch
                      value={value}
                      onValueChange={(newValue) => handleParamChange(key, newValue)}
                    />
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={value !== undefined ? String(value) : ''}
                      onChangeText={(text) => handleParamChange(key, text || undefined)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                </View>
              ))}
              <Button title="Run" onPress={handleRunTest} />
              <Button title="Cancel" onPress={handleModalClose} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    width: 100,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
  },
});

export default Tests;
