import { EmitterSubscription } from "react-native"
import Courier from 'courier-react-native';

export class CourierInboxListener {

  public listenerId?: string
  public onInitialLoad?: EmitterSubscription
  public onError?: EmitterSubscription
  public onMessagesChanged?: EmitterSubscription

  public remove() {

    // Remove the native inbox listener
    if (this.listenerId) {
      Courier.removeInboxListener({ listenerId: this.listenerId });
    }

    // Remove the emitters
    this.onInitialLoad?.remove();
    this.onError?.remove();
    this.onMessagesChanged?.remove();

  }

}