import { CourierDevice } from "..";
import { Modules } from "../Modules";

export class TokenClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async putUserToken(props: { token: string, provider: string, device?: CourierDevice }): Promise<void> {
    await Modules.Client.putUserToken(this.clientId, props.token, props.provider, props.device);
  }

  public async deleteUserToken(props: { token: string }): Promise<void> {
    await Modules.Client.deleteUserToken(this.clientId, props.token);
  }

}