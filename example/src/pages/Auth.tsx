import Courier from '@trycourier/courier-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ExampleServer } from '../Utils';
import {
  CourierEnvironment,
  getUrlsForEnvironment,
  toApiUrls,
} from '../CourierEnvironment';
import {
  AuthPreferencesData,
  loadAuthPreferences,
  saveAuthPreferences,
} from '../AuthPreferences';

const MONO_FONT = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

interface OptionRow {
  key: string;
  value: string;
}

const Auth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [options, setOptions] = useState<OptionRow[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<CourierEnvironment>(CourierEnvironment.Production);
  const [envPickerVisible, setEnvPickerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editValue, setEditValue] = useState('');

  const buildOptions = useCallback(
    (prefs: AuthPreferencesData): OptionRow[] => {
      return [
        { key: 'Environment', value: prefs.environment },
        { key: 'User ID', value: prefs.userId },
        { key: 'Tenant ID (Optional)', value: prefs.tenantId },
        { key: 'API Key', value: prefs.apiKey },
        { key: 'REST URL', value: prefs.restUrl },
        { key: 'GraphQL URL', value: prefs.graphqlUrl },
        { key: 'Inbox GraphQL URL', value: prefs.inboxGraphqlUrl },
        { key: 'Inbox WebSocket', value: prefs.inboxWebSocketUrl },
      ];
    },
    []
  );

  useEffect(() => {
    let authListener: any;

    const init = async () => {
      const prefs = await loadAuthPreferences();
      setSelectedEnvironment(prefs.environment);
      setOptions(buildOptions(prefs));
      setIsLoading(false);

      authListener = await Courier.shared.addAuthenticationListener({
        onUserChanged: async (_userId) => {
          // Refresh UI state when auth changes externally
        },
      });
    };

    init();

    return () => {
      authListener?.remove();
    };
  }, [buildOptions]);

  const saveEnabled = options.length > 1 && options[1]!.value.length > 0;

  const performSave = async () => {
    setIsSaving(true);
    try {
      if (await Courier.shared.getUserId()) {
        await Courier.shared.signOut();
      }
      await performSignIn();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? String(e));
    }
    setIsSaving(false);
  };

  const performSignIn = async () => {
    const userId = options[1]!.value;
    const tenantId = options[2]!.value || undefined;
    const apiKey = options[3]!.value;
    const restUrl = options[4]!.value;

    if (!userId) {
      await Courier.shared.signOut();
      return;
    }

    const jwt = await ExampleServer.generateJwt({
      authKey: apiKey,
      userId: userId,
      baseUrl: restUrl,
    });

    await Courier.shared.signIn({
      userId: userId,
      tenantId: tenantId,
      accessToken: jwt,
      apiUrls: toApiUrls({
        rest: options[4]!.value,
        graphql: options[5]!.value,
        inboxGraphql: options[6]!.value,
        inboxWebSocket: options[7]!.value,
      }),
    });
  };

  const onRowTapped = (index: number) => {
    if (index === 0) {
      setEnvPickerVisible(true);
    } else if (
      index >= 4 &&
      selectedEnvironment !== CourierEnvironment.Custom
    ) {
      // URL rows in non-custom mode: copy to clipboard
      const val = options[index]!.value;
      if (val) {
        Clipboard.setString(val);
        Alert.alert('Copied', val);
      }
    } else {
      setEditIndex(index);
      setEditValue(options[index]!.value);
      setEditModalVisible(true);
    }
  };

  const applyEnvironment = async (env: CourierEnvironment) => {
    setSelectedEnvironment(env);
    const urls = getUrlsForEnvironment(env) ?? {
      rest: options[4]!.value,
      graphql: options[5]!.value,
      inboxGraphql: options[6]!.value,
      inboxWebSocket: options[7]!.value,
    };

    const updated = [...options];
    updated[0] = { key: 'Environment', value: env };
    updated[4] = { key: 'REST URL', value: urls.rest };
    updated[5] = { key: 'GraphQL URL', value: urls.graphql };
    updated[6] = { key: 'Inbox GraphQL URL', value: urls.inboxGraphql };
    updated[7] = { key: 'Inbox WebSocket', value: urls.inboxWebSocket };
    setOptions(updated);

    await saveAuthPreferences({
      environment: env,
      restUrl: urls.rest,
      graphqlUrl: urls.graphql,
      inboxGraphqlUrl: urls.inboxGraphql,
      inboxWebSocketUrl: urls.inboxWebSocket,
    });
  };

  const handleEditSave = async () => {
    const updated = [...options];
    updated[editIndex] = { ...updated[editIndex]!, value: editValue };

    // If editing a URL row, switch to Custom env
    if (editIndex >= 4 && selectedEnvironment !== CourierEnvironment.Custom) {
      setSelectedEnvironment(CourierEnvironment.Custom);
      updated[0] = { key: 'Environment', value: CourierEnvironment.Custom };
      await saveAuthPreferences({ environment: CourierEnvironment.Custom });
    }

    setOptions(updated);
    setEditModalVisible(false);

    const prefKeyMap: Record<number, keyof AuthPreferencesData> = {
      1: 'userId',
      2: 'tenantId',
      3: 'apiKey',
      4: 'restUrl',
      5: 'graphqlUrl',
      6: 'inboxGraphqlUrl',
      7: 'inboxWebSocketUrl',
    };
    const prefKey = prefKeyMap[editIndex];
    if (prefKey) {
      await saveAuthPreferences({ [prefKey]: editValue });
    }
  };

  const getAccessoryIcon = (index: number): string | null => {
    if (index === 0) return '▼';
    if (index >= 4 && selectedEnvironment !== CourierEnvironment.Custom)
      return '⎘';
    return '›';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auth</Text>
        {isSaving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <TouchableOpacity onPress={performSave} disabled={!saveEnabled}>
            <Text
              style={[
                styles.saveButton,
                !saveEnabled && styles.saveButtonDisabled,
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rows */}
      <FlatList
        data={options}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => {
          const displayValue = item.value || 'NOT SET';
          const icon = getAccessoryIcon(index);
          return (
            <Pressable style={styles.row} onPress={() => onRowTapped(index)}>
              <Text style={styles.rowLabel}>{item.key}</Text>
              <View style={styles.rowRight}>
                <Text
                  style={styles.rowValue}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {displayValue}
                </Text>
                {icon && <Text style={styles.rowIcon}>{icon}</Text>}
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Environment Picker Modal */}
      <Modal visible={envPickerVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEnvPickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Select Environment</Text>
            {Object.values(CourierEnvironment).map((env) => (
              <TouchableOpacity
                key={env}
                style={styles.pickerOption}
                onPress={() => {
                  setEnvPickerVisible(false);
                  applyEnvironment(env);
                }}
              >
                <Text style={styles.radioIcon}>
                  {env === selectedEnvironment ? '◉' : '○'}
                </Text>
                <Text style={styles.pickerOptionText}>{env}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.editContent} onPress={() => {}}>
            <Text style={styles.editTitle}>
              {options[editIndex]?.key ?? ''}
            </Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  if (editValue) {
                    Clipboard.setString(editValue);
                    Alert.alert('Copied');
                  }
                }}
              >
                <Text style={styles.editButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonPrimary]}
                onPress={handleEditSave}
              >
                <Text
                  style={[styles.editButtonText, styles.editButtonPrimaryText]}
                >
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 56 : 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: MONO_FONT,
    fontWeight: '700',
    color: '#333',
    flexShrink: 0,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: MONO_FONT,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  rowIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#2196F3',
  },
  pickerOptionText: {
    fontSize: 15,
  },
  editContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
    maxWidth: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: MONO_FONT,
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  editButtonPrimaryText: {
    color: '#fff',
  },
});

export default Auth;
