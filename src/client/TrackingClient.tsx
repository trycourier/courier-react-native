import { CourierTrackingEvent } from "..";
import { Modules } from "../Modules";

export class TrackingClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Posts a tracking URL with associated event data.
   * @param props - The properties for posting the tracking URL.
   * @param props.url - The tracking URL to be posted.
   * @param props.event - The CourierTrackingEvent associated with the URL.
   * @returns A promise that resolves when the tracking URL is successfully posted.
   */
  public async postTrackingUrl(props: { url: string, event: CourierTrackingEvent }): Promise<void> {
    await Modules.Client.postTrackingUrl(this.clientId, props.url, props.event);
  }

} 