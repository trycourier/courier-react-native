import { CourierUserPreferencesChannel } from "./CourierUserPreferencesChannel";
import { CourierUserPreferencesStatus } from "./CourierUserPreferencesStatus";

export interface CourierUserPreferencesTopic {
  defaultStatus?: string;
  hasCustomRouting?: boolean;
  customRouting?: CourierUserPreferencesChannel[];
  status?: CourierUserPreferencesStatus;
  setionName?: string;
  setionId?: string;
  topicId?: string;
  topicName?: string;
}