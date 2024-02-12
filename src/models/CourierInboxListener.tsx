import Courier from "@trycourier/courier-react-native";
import { InboxMessage } from "./InboxMessage";

export class CourierInboxListener {

  readonly listenerId: string
  public onInitialLoad?: () => void
  public onError?: (error: string) => void
  public onMessagesChanged?: (messages: InboxMessage[], unreadMessageCount: number, totalMessageCount: number, canPaginate: boolean) => void

  constructor(id: string) {
    this.listenerId = id;
  }

  public remove() {

    // Remove the native inbox listener
    if (this.listenerId) {
      Courier.shared.removeInboxListener({ listenerId: this.listenerId });
    }

  }

}