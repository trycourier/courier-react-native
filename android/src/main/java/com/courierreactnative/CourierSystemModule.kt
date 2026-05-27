package com.courierreactnative

import android.content.Intent
import android.provider.Settings
import com.courier.android.Courier
import com.courier.android.models.CourierTrackingEvent.CLICKED
import com.courier.android.models.CourierTrackingEvent.DELIVERED
import com.courier.android.modules.isPushPermissionGranted
import com.courier.android.modules.requestNotificationPermission
import com.courier.android.utils.error
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject

class CourierSystemModule(reactContext: ReactApplicationContext): ReactNativeModule(tag = "System Error", name = "CourierSystemModule", reactContext = reactContext) {

  private var lastClickedPushNotification: String? = null

  init {

    Courier.onPushNotificationEvent { event ->
      when (event.trackingEvent) {
        DELIVERED -> postPushNotificationJavascriptEvent(CourierEvents.Push.DELIVERED_EVENT, event.data)
        CLICKED -> postPushNotificationClickedEvent(event.data)
        else -> {}
      }
    }

  }

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun registerPushNotificationClickedOnKilledState() {
    lastClickedPushNotification?.let { payload ->
      reactApplicationContext.sendEvent(
        eventName = CourierEvents.Push.CLICKED_EVENT,
        value = payload
      )
      lastClickedPushNotification = null
    }
  }

  fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClickedEvent(message.data)
    }
  }

  private fun postPushNotificationClickedEvent(data: Map<String, String>) {
    val payload = buildPushPayload(data)
    lastClickedPushNotification = payload
    reactApplicationContext.sendEvent(
      eventName = CourierEvents.Push.CLICKED_EVENT,
      value = payload
    )
  }

  private fun postPushNotificationJavascriptEvent(eventName: String, data: Map<String, String>) {
    val payload = buildPushPayload(data)
    reactApplicationContext.sendEvent(
      eventName = eventName,
      value = payload
    )
  }

  private fun buildPushPayload(data: Map<String, String>): String {
    val rawData = data.toMutableMap()
    val payload = mutableMapOf<String, Any?>()
    val baseKeys = listOf("title", "subtitle", "body", "badge", "sound")
    baseKeys.forEach { key ->
      payload[key] = data[key]
      rawData.remove(key)
    }
    for ((key, value) in rawData) {
      payload[key] = value
    }
    payload["raw"] = data
    return JSONObject(payload).toString()
  }

  @ReactMethod
  fun requestNotificationPermission(promise: Promise) {

    activity?.let { act ->
      Courier.shared.requestNotificationPermission(act)
    }

    promise.resolve("unknown")

  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {

    activity?.let { act ->

      val isGranted = Courier.shared.isPushPermissionGranted(act)
      val status = if (isGranted) "authorized" else "denied"
      promise.resolve(status)
      return

    }

    promise.resolve("unknown")

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun openSettingsForApp(): String? {
    val context = reactApplicationContext
    try {
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
      intent.data = android.net.Uri.parse("package:" + context.packageName)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    } catch (e: Exception) {
      Courier.shared.client?.error(e.toString())
    }
    return null
  }

}
