import Courier from "..";
import { InboxAction } from "./InboxAction";

export class InboxMessage {
  readonly messageId: string;
  readonly title?: string | null;
  readonly body?: string | null;
  readonly preview?: string | null;
  readonly created?: string | null;
  readonly actions?: InboxAction[] | null;
  readonly data?: { [key: string]: any } | null;
  readonly read?: boolean | null;
  readonly opened?: boolean | null;
  readonly archived?: boolean | null;
  readonly subtitle?: string | null;
  readonly time?: string;
  readonly trackingIds?: { [key: string]: any } | null;

  constructor(
    messageId: string,
    title: string | null = null,
    body: string | null = null, 
    preview: string | null = null,
    created: string | null = null,
    actions: InboxAction[] | null = null,
    data: { [key: string]: any } | null = null,
    read: boolean | null = null,
    opened: boolean | null = null,
    archived: boolean | null = null,
    subtitle: string | null = null,
    time: string = '',
    trackingIds: { [key: string]: any } | null = null
  ) {
    this.messageId = messageId;
    this.title = title;
    this.body = body;
    this.preview = preview;
    this.created = created;
    this.actions = actions;
    this.data = data;
    this.read = read;
    this.opened = opened;
    this.archived = archived;
    this.subtitle = subtitle;
    this.time = time;
    this.trackingIds = trackingIds;
  }

  get isRead(): boolean {
    return this.read !== null;
  }

  get isOpened(): boolean {
    return this.opened !== null;
  }

  get isArchived(): boolean {
    return this.archived !== null;
  }

  static fromJson(jsonString: string): InboxMessage {
    try {
      const parsed = JSON.parse(jsonString);
      return new InboxMessage(
        parsed.messageId,
        parsed.title,
        parsed.body,
        parsed.preview,
        parsed.created,
        parsed.actions,
        parsed.data,
        parsed.read,
        parsed.opened,
        parsed.archived,
        parsed.subtitle,
        parsed.time,
        parsed.trackingIds
      );
    } catch (error) {
      console.log(`Error parsing message: ${error}`);
      throw error;
    }
  }

  async markAsRead() {
    await Courier.shared.readMessage({ messageId: this.messageId });
  }

  async markAsUnread() {
    await Courier.shared.unreadMessage({ messageId: this.messageId });
  }

  async markAsArchived() {
    await Courier.shared.archiveMessage({ messageId: this.messageId });
  }

  async markAsOpened() {
    await Courier.shared.openMessage({ messageId: this.messageId });
  }

  async markAsClicked() {
    await Courier.shared.clickMessage({ messageId: this.messageId });
  }

}