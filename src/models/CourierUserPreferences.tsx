import { CourierPaging } from "./CourierPaging";

export interface CourierUserPreferences {
  items: CourierUserPreferencesTopic[];
  paging: CourierPaging;
}

export interface CourierUserPreferencesTopic {
  defaultStatus: CourierUserPreferencesStatus;
  hasCustomRouting: boolean;
  customRouting: CourierUserPreferencesChannel[];
  status: CourierUserPreferencesStatus;
  topicId: string;
  topicName: string;
  sectionName: string;
  sectionId: string;
}

export interface GetCourierUserPreferencesTopic {
  topic: CourierUserPreferencesTopic;
}

// Additional interfaces for CourierUserPreferencesStatus and CourierUserPreferencesChannel would be needed based on their definitions
export enum CourierUserPreferencesStatus {
  OptedIn = "OPTED_IN",
  OptedOut = "OPTED_OUT",
  Required = "REQUIRED",
  Unknown = "UNKNOWN",
}

// Function to get the title of the enum value
export function getCourierUserPreferencesStatusTitle(status: CourierUserPreferencesStatus): string {
  switch (status) {
    case CourierUserPreferencesStatus.OptedIn:
      return "Opted In";
    case CourierUserPreferencesStatus.OptedOut:
      return "Opted Out";
    case CourierUserPreferencesStatus.Required:
      return "Required";
    case CourierUserPreferencesStatus.Unknown:
      return "Unknown";
    default:
      return "Unknown";
  }
}

export enum CourierUserPreferencesChannel {
  DirectMessage = "direct_message",
  Email = "email",
  Push = "push",
  Sms = "sms",
  Webhook = "webhook",
  Unknown = "unknown",
}

// Function to get the title of the enum value
export function getCourierUserPreferencesChannelTitle(channel: CourierUserPreferencesChannel): string {
  switch (channel) {
    case CourierUserPreferencesChannel.DirectMessage:
      return "In App Messages";
    case CourierUserPreferencesChannel.Email:
      return "Emails";
    case CourierUserPreferencesChannel.Push:
      return "Push Notifications";
    case CourierUserPreferencesChannel.Sms:
      return "Text Messages";
    case CourierUserPreferencesChannel.Webhook:
      return "Webhooks";
    case CourierUserPreferencesChannel.Unknown:
      return "Unknown";
    default:
      return "Unknown";
  }
}