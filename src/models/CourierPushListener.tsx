import { EmitterSubscription } from "react-native";
import Courier from "..";

export class CourierPushListener {

  readonly listenerId: string
  public onNotificationClickedListener?: EmitterSubscription
  public onNotificationDeliveredListener?: EmitterSubscription

  constructor(id: string) {
    this.listenerId = id;
  }

  public remove() {
    Courier.shared.removePushNotificationListener({ listenerId: this.listenerId });
    this.onNotificationClickedListener?.remove();
    this.onNotificationDeliveredListener?.remove();
  }

}