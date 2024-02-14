package com.courierreactnative

import android.content.Intent
import android.os.Bundle
import com.courier.android.Courier
import com.courier.android.utils.getLastDeliveredMessage
import com.courier.android.utils.pushNotification
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.ReactActivity
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

open class CourierReactNativeActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // Starts the Courier SDK
    // Used to ensure shared preferences works properly
    Courier.initialize(this)

    super.onCreate(savedInstanceState)

    // See if there is a pending click event
    checkIntentForPushNotificationClick(intent)

    // Handle delivered messages on the main thread
    Courier.shared.getLastDeliveredMessage { message ->
      postPushNotificationDelivered(message)
    }

  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    checkIntentForPushNotificationClick(intent)
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }

  private fun postPushNotificationDelivered(message: RemoteMessage) {
    reactInstanceManager.currentReactContext?.sendEvent(
      eventName = CourierEvents.Push.DELIVERED_EVENT,
      value = JSONObject(message.pushNotification).toString()
    )
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    reactInstanceManager.currentReactContext?.sendEvent(
      eventName = CourierEvents.Push.CLICKED_EVENT,
      value = JSONObject(message.pushNotification).toString()
    )
  }

}
