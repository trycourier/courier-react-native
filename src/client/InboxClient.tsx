import { Modules } from "../Modules";
import { CourierGetInboxMessageResponse, CourierGetInboxMessagesResponse } from "../models/CourierInboxMessages";

export class InboxClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async getMessages(props: { paginationLimit?: number, startCursor?: string }): Promise<CourierGetInboxMessagesResponse> {
    const json = await Modules.Client.getMessages(this.clientId, props.paginationLimit ?? 24, props.startCursor);
    return JSON.parse(json);
  }

  public async getArchivedMessages(props: { paginationLimit?: number, startCursor?: string }): Promise<CourierGetInboxMessagesResponse> {
    const json = await Modules.Client.getArchivedMessages(this.clientId, props.paginationLimit ?? 24, props.startCursor);
    return JSON.parse(json);
  }

  public async getMessageById(props: { messageId: String }): Promise<CourierGetInboxMessageResponse> {
    const json = await Modules.Client.getMessageById(this.clientId, props.messageId);
    return JSON.parse(json);
  }

  public async getUnreadMessageCount(): Promise<number> {
    return await Modules.Client.getUnreadMessageCount(this.clientId);
  }

  public async open(props: { messageId: String }): Promise<number> {
    return await Modules.Client.openMessage(this.clientId, props.messageId);
  }

  public async read(props: { messageId: String }): Promise<number> {
    return await Modules.Client.readMessage(this.clientId, props.messageId);
  }

  public async unread(props: { messageId: String }): Promise<number> {
    return await Modules.Client.unreadMessage(this.clientId, props.messageId);
  }

  public async click(props: { messageId: String, trackingId: string }): Promise<number> {
    return await Modules.Client.clickMessage(this.clientId, props.messageId, props.trackingId);
  }

  public async archive(props: { messageId: String }): Promise<number> {
    return await Modules.Client.archiveMessage(this.clientId, props.messageId);
  }

  public async readAll(): Promise<number> {
    return await Modules.Client.readAllMessages(this.clientId);
  }

}