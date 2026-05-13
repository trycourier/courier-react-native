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
    const pairs = await AsyncStorage.multiGet([
      KEYS.environment,
      KEYS.userId,
      KEYS.tenantId,
      KEYS.apiKey,
      KEYS.restUrl,
      KEYS.graphqlUrl,
      KEYS.inboxGraphqlUrl,
      KEYS.inboxWebSocketUrl,
    ]);

    const map: Record<string, string | null> = {};
    for (const [key, value] of pairs) {
      map[key] = value;
    }

    return {
      environment:
        (map[KEYS.environment] as CourierEnvironment) ??
        CourierEnvironment.Production,
      userId: map[KEYS.userId] ?? '',
      tenantId: map[KEYS.tenantId] ?? '',
      apiKey: map[KEYS.apiKey] ?? Env.authKey,
      restUrl: map[KEYS.restUrl] ?? DEFAULT_URLS.rest,
      graphqlUrl: map[KEYS.graphqlUrl] ?? DEFAULT_URLS.graphql,
      inboxGraphqlUrl:
        map[KEYS.inboxGraphqlUrl] ?? DEFAULT_URLS.inboxGraphql,
      inboxWebSocketUrl:
        map[KEYS.inboxWebSocketUrl] ?? DEFAULT_URLS.inboxWebSocket,
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
    const pairs = Object.entries(entries);
    if (pairs.length > 0) {
      await AsyncStorage.multiSet(pairs);
    }
  } catch (e) {
    console.warn('AsyncStorage save failed:', e);
  }
}
