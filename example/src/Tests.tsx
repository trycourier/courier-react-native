
import { ExampleServer } from "./Utils";
import Env from "./Env";
import { CourierClient } from "@trycourier/courier-react-native";

export class Tests {

  public static async run() {

    const userId = 'test_1';

    const token = await ExampleServer.generateJwt({
      authKey: Env.authKey,
      userId: userId,
    });

    const client = new CourierClient({
      userId: userId,
      showLogs: true,
      jwt: token,
      clientKey: Env.clientKey,
      tenantId: undefined,
      connectionId: undefined,
    });

    const res = await client.brands.getBrand({
      brandId: Env.brandId,
    });

    console.log(res);

    client.remove();

  }

}