import Courier from "@trycourier/courier-react-native";
import { EmitterSubscription } from "react-native";

export class CourierInboxListener {

  readonly listenerId: string
  public onInitialLoad?: EmitterSubscription
  public onError?: EmitterSubscription
  public onMessagesChanged?: EmitterSubscription

  constructor(id: string) {
    this.listenerId = id;
  }

  public remove() {
    Courier.shared.removeInboxListener({ listenerId: this.listenerId });
  }

}