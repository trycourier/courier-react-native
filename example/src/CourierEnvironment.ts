import { CourierApiUrls } from '@trycourier/courier-react-native';

export interface CourierEnvironmentUrls {
  rest: string;
  graphql: string;
  inboxGraphql: string;
  inboxWebSocket: string;
}

export enum CourierEnvironment {
  Production = 'Production',
  ProductionEU = 'Production EU',
  Staging = 'Staging',
  Dev = 'Dev',
  Custom = 'Custom',
}

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
  [CourierEnvironment.Staging]: {
    rest: 'https://api.courierstaging.com',
    graphql: 'https://api.courierstaging.com/client/q',
    inboxGraphql: 'http://inbox.courierstaging.com/',
    inboxWebSocket:
      'wss://inbox-staging-ws-alb-490231599.us-east-1.elb.amazonaws.com',
  },
  [CourierEnvironment.Dev]: {
    rest: 'https://api.courierdev.com',
    graphql: 'https://api.courierdev.com/client/q',
    inboxGraphql: 'https://inbox.courierdev.com/q',
    inboxWebSocket: 'wss://9mrugsdnk1.execute-api.us-east-1.amazonaws.com/dev',
  },
};

export const DEFAULT_URLS: CourierEnvironmentUrls = {
  rest: 'https://api.courier.com',
  graphql: 'https://api.courier.com/client/q',
  inboxGraphql: 'https://inbox.courier.com/q',
  inboxWebSocket: 'wss://realtime.courier.io',
};

export function getUrlsForEnvironment(
  env: CourierEnvironment
): CourierEnvironmentUrls | null {
  if (env === CourierEnvironment.Custom) return null;
  return environmentUrls[env] ?? null;
}

export function toApiUrls(urls: CourierEnvironmentUrls): CourierApiUrls {
  return {
    rest: urls.rest,
    graphql: urls.graphql,
    inboxGraphql: urls.inboxGraphql,
    inboxWebSocket: urls.inboxWebSocket,
  };
}
