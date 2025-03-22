import Courier from "..";
import { EmitterSubscription } from "react-native";

export class CourierInboxListener {
  readonly listenerId: string;

  public onLoading?: EmitterSubscription;
  public onError?: EmitterSubscription;
  public onUnreadCountChanged?: EmitterSubscription;
  public onTotalCountChanged?: EmitterSubscription;
  public onMessagesChanged?: EmitterSubscription;
  public onPageAdded?: EmitterSubscription;
  public onMessageEvent?: EmitterSubscription;

  constructor(id: string) {
    this.listenerId = id;
  }

  public async remove() {
    // Remove this listener from native code
    await Courier.shared.removeInboxListener({ listenerId: this.listenerId });
  }
}