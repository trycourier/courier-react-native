package com.courierreactnative

internal class CourierEvents {

  companion object {
    const val COURIER_ERROR_TAG = "Courier Android SDK Error"
  }

  object Log {
    const val DEBUG_LOG = "courierDebugEvent"
  }

  object Push {
    const val CLICKED_EVENT = "pushNotificationClicked"
    const val DELIVERED_EVENT = "pushNotificationDelivered"
  }

}
