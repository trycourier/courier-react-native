import { InboxMessage } from "./InboxMessage";

export interface CourierGetInboxMessagesResponse {
  data?: GetInboxMessagesData;
}

export interface GetInboxMessagesData {
  count?: number;
  messages?: GetInboxMessagesNodes;
}

export interface GetInboxMessagesNodes {
  pageInfo?: GetInboxMessagesPageInfo;
  nodes?: InboxMessage[];
}

export interface GetInboxMessagesPageInfo {
  startCursor?: string;
  hasNextPage?: boolean;
}

export interface CourierGetInboxMessageResponse {
  data?: GetInboxMessageData;
}

export interface GetInboxMessageData {
  message: InboxMessage;
}