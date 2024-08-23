import { CourierTrackingEvent } from "..";
import { Modules } from "../Modules";

export class TrackingClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async postTrackingUrl(props: { url: string, event: CourierTrackingEvent }): Promise<void> {
    await Modules.Client.postTrackingUrl(this.clientId, props.url, props.event);
  }

} 