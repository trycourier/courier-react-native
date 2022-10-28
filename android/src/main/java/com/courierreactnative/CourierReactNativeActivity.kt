package com.courierreactnative

import android.content.Intent
import android.os.Bundle
import com.courier.android.Courier
import com.courier.android.pushNotification
import com.courier.android.trackPushNotificationClick
import com.facebook.react.ReactActivity
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

open class CourierReactNativeActivity() : ReactActivity() {
  companion object {
    internal const val PUSH_CLICKED_EVENT = "pushNotificationClicked"
    internal const val PUSH_DELIVERED_EVENT = "pushNotificationDelivered"
  }
  private fun sendEvent(eventName: String, params: String) {
    val reactContext = reactInstanceManager.currentReactContext
    reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)?.emit(eventName, params)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    Courier.initialize(this)

    // See if there is a pending click event
    checkIntentForPushNotificationClick(intent)

    // Handle delivered messages on the main thread
    Courier.getLastDeliveredMessage { message ->
      postPushNotificationDelivered(message)
    }

  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    checkIntentForPushNotificationClick(intent);
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }


  private fun postPushNotificationDelivered(message: RemoteMessage) {
    sendEvent(PUSH_DELIVERED_EVENT, JSONObject(message.pushNotification).toString())
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    sendEvent(PUSH_CLICKED_EVENT, JSONObject(message.pushNotification).toString());
  }
}
