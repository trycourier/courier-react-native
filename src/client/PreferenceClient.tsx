import { Modules } from "../Modules";
import { CourierUserPreferences, CourierUserPreferencesChannel, CourierUserPreferencesStatus, CourierUserPreferencesTopic } from "../models/CourierUserPreferences";

export class PreferenceClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  public async getUserPreferences(props?: { paginationCursor?: string }): Promise<CourierUserPreferences> {

    const json = await Modules.Client.getUserPreferences(this.clientId, props?.paginationCursor);
    
    const rawData = JSON.parse(json);
  
    return {
      items: rawData.items.map((item: any) => ({
        defaultStatus: item.default_status as CourierUserPreferencesStatus,
        hasCustomRouting: item.has_custom_routing,
        customRouting: item.custom_routing.map((channel: string) => channel as CourierUserPreferencesChannel),
        status: item.status as CourierUserPreferencesStatus,
        topicId: item.topic_id,
        topicName: item.topic_name,
        sectionName: item.section_name,
        sectionId: item.section_id
      })),
      paging: rawData.paging
    };

  }

  public async getUserPreferenceTopic(props: { topicId: string }): Promise<CourierUserPreferencesTopic> {
    const json = await Modules.Client.getUserPreferenceTopic(this.clientId, props.topicId);
    const rawData = JSON.parse(json);
  
    const convertedTopic: CourierUserPreferencesTopic = {
      defaultStatus: rawData.default_status as CourierUserPreferencesStatus,
      hasCustomRouting: rawData.has_custom_routing,
      customRouting: rawData.custom_routing.map((channel: string) => channel as CourierUserPreferencesChannel),
      status: rawData.status as CourierUserPreferencesStatus,
      topicId: rawData.topic_id,
      topicName: rawData.topic_name,
      sectionName: rawData.section_name,
      sectionId: rawData.section_id
    };
  
    return convertedTopic;
  }

  public async putUserPreferenceTopic(props: { topicId: string, status: CourierUserPreferencesStatus, hasCustomRouting: boolean, customRouting: CourierUserPreferencesChannel[] }): Promise<void> {
    await Modules.Client.putUserPreferenceTopic(this.clientId, props.topicId, props.status, props.hasCustomRouting, props.customRouting);
  }

}