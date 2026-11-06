import { CourierApiUrls } from '@trycourier/courier-react-native';
import Env from './Env';

export interface CourierEnvironmentUrls {
  rest: string;
  graphql: string;
  inboxGraphql: string;
  inboxWebSocket: string;
}

export const CourierEnvironment = {
  Production: 'Production',
  ProductionEU: 'Production EU',
  Custom: 'Custom',
} as const;

// Names are plain strings so Env.tsx can add its own environments (see localEnvironments)
export type CourierEnvironment = string;

const environmentUrls: Record<string, CourierEnvironmentUrls> = {
  [CourierEnvironment.Production]: {
    rest: 'https://api.courier.com',
    graphql: 'https://api.courier.com/client/q',
    inboxGraphql: 'https://inbox.courier.com/q',
    inboxWebSocket: 'wss://realtime.courier.io',
  },
  [CourierEnvironment.ProductionEU]: {
    rest: 'https://api.eu.courier.com',
    graphql: 'https://api.eu.courier.com/client/q',
    inboxGraphql: 'https://inbox.eu.courier.io/q',
    inboxWebSocket: 'wss://realtime.eu.courier.io',
  },
};

export const DEFAULT_URLS: CourierEnvironmentUrls = {
  rest: 'https://api.courier.com',
  graphql: 'https://api.courier.com/client/q',
  inboxGraphql: 'https://inbox.courier.com/q',
  inboxWebSocket: 'wss://realtime.courier.io',
};

/**
 * Extra environments for local builds, declared in the gitignored Env.tsx. The picker lists
 * them between Production EU and Custom:
 *
 *   static readonly localEnvironments = {
 *     'My Environment': { rest: 'https://…', graphql: 'https://…/client/q', inboxGraphql: 'https://…/q', inboxWebSocket: 'wss://…' },
 *   };
 *
 * It's optional, so an Env.tsx without it (like the one CI writes) still type-checks.
 */
function localEnvironments(): Record<string, CourierEnvironmentUrls> {
  return (
    (
      Env as unknown as {
        localEnvironments?: Record<string, CourierEnvironmentUrls>;
      }
    ).localEnvironments ?? {}
  );
}

export function environmentNames(): CourierEnvironment[] {
  return [
    CourierEnvironment.Production,
    CourierEnvironment.ProductionEU,
    ...Object.keys(localEnvironments()),
    CourierEnvironment.Custom,
  ];
}

// A saved environment this build doesn't define keeps its saved URLs, so it shows as Custom
export function resolveEnvironment(name: string): CourierEnvironment {
  return environmentNames().includes(name) ? name : CourierEnvironment.Custom;
}

export function getUrlsForEnvironment(
  env: CourierEnvironment
): CourierEnvironmentUrls | null {
  if (env === CourierEnvironment.Custom) return null;
  return environmentUrls[env] ?? localEnvironments()[env] ?? null;
}

export function toApiUrls(urls: CourierEnvironmentUrls): CourierApiUrls {
  return {
    rest: urls.rest,
    graphql: urls.graphql,
    inboxGraphql: urls.inboxGraphql,
    inboxWebSocket: urls.inboxWebSocket,
  };
}
