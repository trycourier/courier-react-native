import { EmitterSubscription } from "react-native";
import Courier from "..";

export class CourierAuthenticationListener {

  public listenerId?: string
  public onUserChanged?: EmitterSubscription

  public remove() {

    if (this.listenerId) {
      Courier.shared.removeInboxListener({ listenerId: this.listenerId });
    }

    this.onUserChanged?.remove();
    
  }

}