import { Modules } from "../Modules";
import { CourierUserPreferences, CourierUserPreferencesChannel, CourierUserPreferencesStatus, CourierUserPreferencesTopic } from "../models/CourierUserPreferences";

export class PreferenceClient {

  readonly clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Retrieves user preferences.
   * @param props - Optional properties for pagination.
   * @param props.paginationCursor - Optional cursor for pagination.
   * @returns A promise that resolves with CourierUserPreferences containing user preference items and paging information.
   */
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

  /**
   * Retrieves user preference for a specific topic.
   * @param props - Properties for getting the user preference topic.
   * @param props.topicId - The ID of the topic to retrieve preferences for.
   * @returns A promise that resolves with CourierUserPreferencesTopic containing the topic preference details.
   */
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

  /**
   * Updates user preference for a specific topic.
   * @param props - Properties for updating the user preference topic.
   * @param props.topicId - The ID of the topic to update preferences for.
   * @param props.status - The new status for the topic preference.
   * @param props.hasCustomRouting - Whether the topic has custom routing.
   * @param props.customRouting - Array of custom routing channels.
   * @returns A promise that resolves when the update is complete.
   */
  public async putUserPreferenceTopic(props: { topicId: string, status: CourierUserPreferencesStatus, hasCustomRouting: boolean, customRouting: CourierUserPreferencesChannel[] }): Promise<void> {
    await Modules.Client.putUserPreferenceTopic(this.clientId, props.topicId, props.status, props.hasCustomRouting, props.customRouting);
  }

}