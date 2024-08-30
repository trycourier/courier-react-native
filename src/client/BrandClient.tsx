import { Modules } from "../Modules";
import { CourierBrandResponse } from "..";

export class BrandClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Retrieves brand information for a specific brand ID.
   * @param props - The properties for getting the brand.
   * @param props.brandId - The ID of the brand to retrieve.
   * @returns A promise that resolves with the CourierBrandResponse containing brand information.
   */
  public async getBrand(props: { brandId: string }): Promise<CourierBrandResponse> {
    const json = await Modules.Client.getBrand(this.clientId, props.brandId);
    return JSON.parse(json);
  }

}