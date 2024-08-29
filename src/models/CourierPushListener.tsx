export class CourierPushListener {

  readonly listenerId: string
  public onPushNotificationClicked?: (push: any) => void
  public onPushNotificationDelivered?: (push: any) => void

  constructor(id: string, onPushNotificationClicked?: (push: any) => void, onPushNotificationDelivered?: (push: any) => void) {
    this.listenerId = id;
    this.onPushNotificationClicked = onPushNotificationClicked;
    this.onPushNotificationDelivered = onPushNotificationDelivered;
  }

  public remove() {
    this.onPushNotificationClicked = undefined;
    this.onPushNotificationDelivered = undefined;
  }

}