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

export async function loadAuthPreferences(): Promise<AuthPreferencesData> {
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

  const results: Record<string, string | null> = {};
  for (const [key, value] of pairs) {
    results[key] = value;
  }

  return {
    environment:
      (results[KEYS.environment] as CourierEnvironment) ??
      CourierEnvironment.Production,
    userId: results[KEYS.userId] ?? '',
    tenantId: results[KEYS.tenantId] ?? '',
    apiKey: results[KEYS.apiKey] ?? Env.authKey,
    restUrl: results[KEYS.restUrl] ?? DEFAULT_URLS.rest,
    graphqlUrl: results[KEYS.graphqlUrl] ?? DEFAULT_URLS.graphql,
    inboxGraphqlUrl: results[KEYS.inboxGraphqlUrl] ?? DEFAULT_URLS.inboxGraphql,
    inboxWebSocketUrl:
      results[KEYS.inboxWebSocketUrl] ?? DEFAULT_URLS.inboxWebSocket,
  };
}

export async function saveAuthPreferences(
  data: Partial<AuthPreferencesData>
): Promise<void> {
  const pairs: [string, string][] = [];
  if (data.environment !== undefined)
    pairs.push([KEYS.environment, data.environment]);
  if (data.userId !== undefined) pairs.push([KEYS.userId, data.userId]);
  if (data.tenantId !== undefined) pairs.push([KEYS.tenantId, data.tenantId]);
  if (data.apiKey !== undefined) pairs.push([KEYS.apiKey, data.apiKey]);
  if (data.restUrl !== undefined) pairs.push([KEYS.restUrl, data.restUrl]);
  if (data.graphqlUrl !== undefined)
    pairs.push([KEYS.graphqlUrl, data.graphqlUrl]);
  if (data.inboxGraphqlUrl !== undefined)
    pairs.push([KEYS.inboxGraphqlUrl, data.inboxGraphqlUrl]);
  if (data.inboxWebSocketUrl !== undefined)
    pairs.push([KEYS.inboxWebSocketUrl, data.inboxWebSocketUrl]);
  if (pairs.length > 0) {
    await AsyncStorage.multiSet(pairs);
  }
}
