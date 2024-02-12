import { InboxAction } from "./InboxAction";

export interface InboxMessage {
  messageId: string;
  title?: string | null;
  body?: string | null;
  preview?: string | null;
  created?: string | null;
  actions?: InboxAction[] | null;
  data?: { [key: string]: any } | null;
  read?: boolean | null;
  opened?: boolean | null;
  archived?: boolean | null
  subtitle?: string | null;
  time?: string;
  trackingIds?: { [key: string]: any } | null
}