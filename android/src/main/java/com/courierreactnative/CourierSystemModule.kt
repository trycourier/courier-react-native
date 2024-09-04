package com.courierreactnative

import android.content.Intent
import android.provider.Settings
import com.courier.android.Courier
import com.courier.android.modules.isPushPermissionGranted
import com.courier.android.modules.requestNotificationPermission
import com.courier.android.utils.error
import com.courier.android.utils.pushNotification
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

class CourierSystemModule(reactContext: ReactApplicationContext): ReactNativeModule(tag = "System Error", name = "CourierSystemModule", reactContext = reactContext) {

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
    reactActivity?.let { activity ->
      checkIntentForPushNotificationClick(activity.intent)
    }
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    reactApplicationContext.sendEvent(
      eventName = CourierEvents.Push.CLICKED_EVENT,
      value = JSONObject(message.pushNotification).toString()
    )
  }

  @ReactMethod
  fun requestNotificationPermission(promise: Promise) {

    reactActivity?.let { activity ->
      Courier.shared.requestNotificationPermission(activity)
    }

    promise.resolve("unknown")

  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {

    reactActivity?.let { context ->

      val isGranted = Courier.shared.isPushPermissionGranted(context)
      val status = if (isGranted) "authorized" else "denied"
      promise.resolve(status)
      return

    }

    promise.resolve("unknown")

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun openSettingsForApp(): String? {
    // TODO: Move this to the native package in the future
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