import { Modules } from "../Modules";
import { CourierGetInboxMessageResponse, CourierGetInboxMessagesResponse } from "../models/CourierInboxMessages";

export class InboxClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Retrieves messages from the inbox.
   * @param props - The properties for getting messages.
   * @param props.paginationLimit - Optional. The number of messages to retrieve per page. Defaults to 24.
   * @param props.startCursor - Optional. The cursor to start retrieving messages from.
   * @returns A promise that resolves with the CourierGetInboxMessagesResponse containing the messages.
   */
  public async getMessages(props: { paginationLimit?: number, startCursor?: string }): Promise<CourierGetInboxMessagesResponse> {
    const json = await Modules.Client.getMessages(this.clientId, props.paginationLimit ?? 24, props.startCursor);
    return JSON.parse(json);
  }

  /**
   * Retrieves archived messages from the inbox.
   * @param props - The properties for getting archived messages.
   * @param props.paginationLimit - Optional. The number of messages to retrieve per page. Defaults to 24.
   * @param props.startCursor - Optional. The cursor to start retrieving messages from.
   * @returns A promise that resolves with the CourierGetInboxMessagesResponse containing the archived messages.
   */
  public async getArchivedMessages(props: { paginationLimit?: number, startCursor?: string }): Promise<CourierGetInboxMessagesResponse> {
    const json = await Modules.Client.getArchivedMessages(this.clientId, props.paginationLimit ?? 24, props.startCursor);
    return JSON.parse(json);
  }

  /**
   * Retrieves a specific message by its ID.
   * @param props - The properties for getting the message.
   * @param props.messageId - The ID of the message to retrieve.
   * @returns A promise that resolves with the CourierGetInboxMessageResponse containing the message.
   */
  public async getMessageById(props: { messageId: String }): Promise<CourierGetInboxMessageResponse> {
    const json = await Modules.Client.getMessageById(this.clientId, props.messageId);
    return JSON.parse(json);
  }

  /**
   * Retrieves the count of unread messages in the inbox.
   * @returns A promise that resolves with the number of unread messages.
   */
  public async getUnreadMessageCount(): Promise<number> {
    return await Modules.Client.getUnreadMessageCount(this.clientId);
  }

  /**
   * Marks a message as opened.
   * @param props - The properties for opening the message.
   * @param props.messageId - The ID of the message to mark as opened.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async open(props: { messageId: String }): Promise<number> {
    return await Modules.Client.openMessage(this.clientId, props.messageId);
  }

  /**
   * Marks a message as read.
   * @param props - The properties for reading the message.
   * @param props.messageId - The ID of the message to mark as read.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async read(props: { messageId: String }): Promise<number> {
    return await Modules.Client.readMessage(this.clientId, props.messageId);
  }

  /**
   * Marks a message as unread.
   * @param props - The properties for marking the message as unread.
   * @param props.messageId - The ID of the message to mark as unread.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async unread(props: { messageId: String }): Promise<number> {
    return await Modules.Client.unreadMessage(this.clientId, props.messageId);
  }

  /**
   * Records a click event for a message.
   * @param props - The properties for clicking the message.
   * @param props.messageId - The ID of the message that was clicked.
   * @param props.trackingId - The tracking ID associated with the click event.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async click(props: { messageId: String, trackingId: string }): Promise<number> {
    return await Modules.Client.clickMessage(this.clientId, props.messageId, props.trackingId);
  }

  /**
   * Archives a message.
   * @param props - The properties for archiving the message.
   * @param props.messageId - The ID of the message to archive.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async archive(props: { messageId: String }): Promise<number> {
    return await Modules.Client.archiveMessage(this.clientId, props.messageId);
  }

  /**
   * Marks all messages as read.
   * @returns A promise that resolves with a number indicating the operation result.
   */
  public async readAll(): Promise<number> {
    return await Modules.Client.readAllMessages(this.clientId);
  }

}