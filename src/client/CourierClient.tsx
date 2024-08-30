import { BrandClient } from "..";
import { ClientModule } from "./ClientModule";
import { InboxClient } from "./InboxClient";
import { PreferenceClient } from "./PreferenceClient";
import { TokenClient } from "./TokenClient";
import { TrackingClient } from "./TrackingClient";

export interface CourierClientOptions {
  userId: string;
  showLogs: boolean;
  jwt?: string;
  clientKey?: string;
  connectionId?: string;
  tenantId?: string;
}

export class CourierClient extends ClientModule {

  public readonly options: CourierClientOptions;
  public readonly tokens: TokenClient;
  public readonly brands: BrandClient;
  public readonly inbox: InboxClient;
  public readonly preferences: PreferenceClient;
  public readonly tracking: TrackingClient;

  constructor(props: { userId: string, jwt?: string, clientKey?: string, connectionId?: string, tenantId?: string, showLogs?: boolean }) {

    const options = {
      userId: props.userId,
      showLogs: props.showLogs ?? __DEV__,
      jwt: props.jwt,
      clientKey: props.clientKey,
      connectionId: props.clientKey,
      tenantId: props.tenantId,
    };

    super(options);

    this.options = options

    this.tokens = new TokenClient(this.clientId);
    this.brands = new BrandClient(this.clientId);
    this.inbox = new InboxClient(this.clientId);
    this.preferences = new PreferenceClient(this.clientId);
    this.tracking = new TrackingClient(this.clientId);
    
  }

}