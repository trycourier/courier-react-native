import { CourierUserPreferencesChannel } from "./CourierUserPreferencesChannel";
import { CourierUserPreferencesStatus } from "./CourierUserPreferencesStatus";

export interface CourierUserPreferencesTopic {
  defaultStatus?: string;
  hasCustomRouting?: string;
  customRouting?: CourierUserPreferencesChannel[];
  status?: CourierUserPreferencesStatus;
  topicId?: string;
  topicName?: string;
}