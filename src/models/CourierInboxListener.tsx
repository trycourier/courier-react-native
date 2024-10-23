import Courier from "..";
import { EmitterSubscription } from "react-native";

export class CourierInboxListener {

  readonly listenerId: string
  public onInitialLoad?: EmitterSubscription
  public onError?: EmitterSubscription
  public onMessagesChanged?: EmitterSubscription
  public onUnreadCountChanged?: EmitterSubscription
  public onFeedChanged?: EmitterSubscription
  public onArchiveChanged?: EmitterSubscription
  public onPageAdded?: EmitterSubscription
  public onMessageChanged?: EmitterSubscription
  public onMessageAdded?: EmitterSubscription
  public onMessageRemoved?: EmitterSubscription
  
  constructor(id: string) {
    this.listenerId = id;
  }

  public remove() {
    Courier.shared.removeInboxListener({ listenerId: this.listenerId });
  }

}