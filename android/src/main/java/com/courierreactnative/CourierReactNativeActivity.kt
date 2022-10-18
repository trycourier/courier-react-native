package com.courierreactnative

import android.content.Intent
import android.os.Bundle
import com.courier.android.Courier
import com.courier.android.pushNotification
import com.courier.android.trackPushNotificationClick
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject

public open class CourierReactNativeActivity : ReactActivity() {
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String? {
    return "main"
  }

  //  TODO: send event to react-native side


  /**
   * Returns the instance of the [ReactActivityDelegate]. There the RootView is created and
   * you can specify the rendered you wish to use (Fabric or the older renderer).
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return MainActivityDelegate(this, mainComponentName)
  }

  class MainActivityDelegate(activity: ReactActivity?, mainComponentName: String?) :
    ReactActivityDelegate(activity, mainComponentName) {
    override fun createRootView(): ReactRootView {
      val reactRootView = ReactRootView(context)
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(false)
      return reactRootView
    }
  }

  private fun sendEvent(eventName: String, params: String) {
    val reactContext = reactInstanceManager.currentReactContext;
    reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(eventName, params)
  }


  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

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
      sendEvent("pushNotificationDelivered", JSONObject(message.pushNotification).toString())
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    sendEvent("pushNotificationClicked",JSONObject(message.pushNotification).toString());
  }
}
