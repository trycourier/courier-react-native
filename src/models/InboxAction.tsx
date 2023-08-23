export interface InboxAction {
  content?: string | null;
  href?: string | null;
  data?: { [key: string]: any } | null;
}