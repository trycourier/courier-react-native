export interface CourierApiUrls {
  rest: string;
  graphql: string;
  inboxGraphql: string;
  inboxWebSocket: string;
}

export type CourierApiRegion = 'us' | 'eu';

export const DEFAULT_COURIER_API_URLS: CourierApiUrls = {
  rest: 'https://api.courier.com',
  graphql: 'https://api.courier.com/client/q',
  inboxGraphql: 'https://inbox.courier.io/q',
  inboxWebSocket: 'wss://realtime.courier.io'
};

export const EU_COURIER_API_URLS: CourierApiUrls = {
  rest: 'https://api.eu.courier.com',
  graphql: 'https://api.eu.courier.com/client/q',
  inboxGraphql: 'https://inbox.eu.courier.io/q',
  inboxWebSocket: 'wss://realtime.eu.courier.io'
};

export function getCourierApiUrlsForRegion(
  region: CourierApiRegion
): CourierApiUrls {
  return region === 'eu'
    ? { ...EU_COURIER_API_URLS }
    : { ...DEFAULT_COURIER_API_URLS };
}
