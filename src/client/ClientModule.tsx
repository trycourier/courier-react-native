import { Modules } from "../Modules";
import { CourierClientOptions } from "./CourierClient";

export abstract class ClientModule {

  readonly clientId: string;

  // Constructor to create a low level CourierClient
  constructor(options: CourierClientOptions) {
    this.clientId = this.add(options);
  }
  
  private add(options: CourierClientOptions): string {
    return Modules.Client.addClient(options);
  }

  public remove(): string {
    return Modules.Client.removeClient(this.clientId);
  }

}