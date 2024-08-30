import { CourierDevice } from "..";
import { Modules } from "../Modules";

export class TokenClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Stores a user token for a specific provider.
   * @param props - The properties for storing the user token.
   * @param props.token - The token to be stored.
   * @param props.provider - The provider associated with the token.
   * @param props.device - Optional device information.
   * @returns A promise that resolves when the token is successfully stored.
   */
  public async putUserToken(props: { token: string, provider: string, device?: CourierDevice }): Promise<void> {
    await Modules.Client.putUserToken(this.clientId, props.token, props.provider, props.device);
  }

  /**
   * Deletes a user token.
   * @param props - The properties for deleting the user token.
   * @param props.token - The token to be deleted.
   * @returns A promise that resolves when the token is successfully deleted.
   */
  public async deleteUserToken(props: { token: string }): Promise<void> {
    await Modules.Client.deleteUserToken(this.clientId, props.token);
  }

}