import { Modules } from "../Modules";
import { CourierBrandResponse } from "..";

export class BrandClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async getBrand(props: { brandId: string }): Promise<CourierBrandResponse> {
    const json = await Modules.Client.getBrand(this.clientId, props.brandId);
    return JSON.parse(json);
  }

}