import { CourierBrandResponse } from "..";
import { ClientModule } from "./ClientModule";

export class BrandClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async getBrand(props: { brandId: string }): Promise<CourierBrandResponse> {
    const json = await ClientModule.NativeModule.getBrand(this.clientId, props.brandId);
    return JSON.parse(json);
  }

}