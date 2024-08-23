import { Modules } from "../Modules";
import { CourierUserPreferences, CourierUserPreferencesChannel, CourierUserPreferencesStatus, GetCourierUserPreferencesTopic } from "../models/CourierUserPreferences";

export class PreferenceClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async getUserPreferences(props: { paginationCursor?: string }): Promise<CourierUserPreferences> {
    const json = await Modules.Client.getUserPreferences(this.clientId, props.paginationCursor);
    return JSON.parse(json);
  }

  public async getUserPreferenceTopic(props: { topicId: string }): Promise<GetCourierUserPreferencesTopic> {
    const json = await Modules.Client.getUserPreferenceTopic(this.clientId, props.topicId);
    return JSON.parse(json);
  }

  public async putUserPreferenceTopic(props: { topicId: string, status: CourierUserPreferencesStatus, hasCustomRouting: boolean, customRouting: CourierUserPreferencesChannel[] }): Promise<void> {
    await Modules.Client.putUserPreferenceTopic(this.clientId, props.topicId, props.status, props.hasCustomRouting, props.customRouting);
  }

}