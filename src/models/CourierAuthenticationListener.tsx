import { EmitterSubscription } from "react-native";
import Courier from "..";

export class CourierAuthenticationListener {

  readonly listenerId: string
  public onUserChanged?: EmitterSubscription

  constructor(id: string) {
    this.listenerId = id;
  }

  public remove() {

    // Remove the native inbox listener
    Courier.shared.removeInboxListener({ listenerId: this.listenerId });

    // Remove the emitter
    this.onUserChanged?.remove();
    
  }

}