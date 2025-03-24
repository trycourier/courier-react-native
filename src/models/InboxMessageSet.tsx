import { InboxMessage } from "./InboxMessage";

export interface InboxMessageSet {
  messages: InboxMessage[];
  totalMessageCount: number;
  canPaginate: boolean;
}
