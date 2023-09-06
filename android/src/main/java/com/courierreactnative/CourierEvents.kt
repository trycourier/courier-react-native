package com.courierreactnative

internal class CourierEvents {

  companion object {
    const val COURIER_ERROR_TAG = "Courier Android SDK Error"
  }

  object Log {
    const val DEBUG_LOG = "courierDebugEvent"
  }

  object Auth {
    const val USER_CHANGED = "courierAuthUserChanged"
  }

  object Push {
    const val CLICKED_EVENT = "pushNotificationClicked"
    const val DELIVERED_EVENT = "pushNotificationDelivered"
  }

  object Inbox {
    const val INITIAL_LOADING = "inboxInitialLoad"
    const val ERROR = "inboxError"
    const val MESSAGES_CHANGED = "inboxMessagesChanged"
  }

}
