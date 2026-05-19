import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourierEnvironment, DEFAULT_URLS } from './CourierEnvironment';
import Env from './Env';

const KEYS = {
  environment: '@auth_environment',
  userId: '@auth_userId',
  tenantId: '@auth_tenantId',
  apiKey: '@auth_apiKey',
  restUrl: '@auth_restUrl',
  graphqlUrl: '@auth_graphqlUrl',
  inboxGraphqlUrl: '@auth_inboxGraphqlUrl',
  inboxWebSocketUrl: '@auth_inboxWebSocketUrl',
} as const;

export interface AuthPreferencesData {
  environment: CourierEnvironment;
  userId: string;
  tenantId: string;
  apiKey: string;
  restUrl: string;
  graphqlUrl: string;
  inboxGraphqlUrl: string;
  inboxWebSocketUrl: string;
}

function defaults(): AuthPreferencesData {
  return {
    environment: CourierEnvironment.Production,
    userId: '',
    tenantId: '',
    apiKey: Env.authKey,
    restUrl: DEFAULT_URLS.rest,
    graphqlUrl: DEFAULT_URLS.graphql,
    inboxGraphqlUrl: DEFAULT_URLS.inboxGraphql,
    inboxWebSocketUrl: DEFAULT_URLS.inboxWebSocket,
  };
}

export async function loadAuthPreferences(): Promise<AuthPreferencesData> {
  try {
    const results = await AsyncStorage.getMany([
      KEYS.environment,
      KEYS.userId,
      KEYS.tenantId,
      KEYS.apiKey,
      KEYS.restUrl,
      KEYS.graphqlUrl,
      KEYS.inboxGraphqlUrl,
      KEYS.inboxWebSocketUrl,
    ]);

    return {
      environment:
        (results[KEYS.environment] as CourierEnvironment) ??
        CourierEnvironment.Production,
      userId: results[KEYS.userId] ?? '',
      tenantId: results[KEYS.tenantId] ?? '',
      apiKey: results[KEYS.apiKey] ?? Env.authKey,
      restUrl: results[KEYS.restUrl] ?? DEFAULT_URLS.rest,
      graphqlUrl: results[KEYS.graphqlUrl] ?? DEFAULT_URLS.graphql,
      inboxGraphqlUrl:
        results[KEYS.inboxGraphqlUrl] ?? DEFAULT_URLS.inboxGraphql,
      inboxWebSocketUrl:
        results[KEYS.inboxWebSocketUrl] ?? DEFAULT_URLS.inboxWebSocket,
    };
  } catch (e) {
    console.warn('AsyncStorage load failed, using defaults:', e);
    return defaults();
  }
}

export async function saveAuthPreferences(
  data: Partial<AuthPreferencesData>
): Promise<void> {
  try {
    const entries: Record<string, string> = {};
    if (data.environment !== undefined)
      entries[KEYS.environment] = data.environment;
    if (data.userId !== undefined) entries[KEYS.userId] = data.userId;
    if (data.tenantId !== undefined) entries[KEYS.tenantId] = data.tenantId;
    if (data.apiKey !== undefined) entries[KEYS.apiKey] = data.apiKey;
    if (data.restUrl !== undefined) entries[KEYS.restUrl] = data.restUrl;
    if (data.graphqlUrl !== undefined)
      entries[KEYS.graphqlUrl] = data.graphqlUrl;
    if (data.inboxGraphqlUrl !== undefined)
      entries[KEYS.inboxGraphqlUrl] = data.inboxGraphqlUrl;
    if (data.inboxWebSocketUrl !== undefined)
      entries[KEYS.inboxWebSocketUrl] = data.inboxWebSocketUrl;
    if (Object.keys(entries).length > 0) {
      await AsyncStorage.setMany(entries);
    }
  } catch (e) {
    console.warn('AsyncStorage save failed:', e);
  }
}
