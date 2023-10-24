import { CourierPaging } from "./CourierPaging";
import { CourierUserPreferencesTopic } from "./CourierUserPreferencesTopic";

export interface CourierUserPreferences {
  items?: CourierUserPreferencesTopic[];
  paging?: CourierPaging;
}