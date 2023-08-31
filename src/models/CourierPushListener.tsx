import { EmitterSubscription } from "react-native";

export class CourierPushListener {

  public onNotificationClickedListener?: EmitterSubscription
  public onNotificationDeliveredListener?: EmitterSubscription

  public remove() {
    this.onNotificationClickedListener?.remove();
    this.onNotificationDeliveredListener?.remove();
  }

}