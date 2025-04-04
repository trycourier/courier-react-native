package com.courierreactnative

import android.content.Intent
import android.os.Bundle
import com.courier.android.Courier
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.ReactActivity

open class CourierReactNativeActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {

    // Update the user agent
    Courier.agent = Utils.COURIER_AGENT

    // Starts the Courier SDK
    // Used to ensure shared preferences works properly
    Courier.initialize(this)

    super.onCreate(savedInstanceState)

    // See if there is a pending click event
    checkIntentForPushNotificationClick(intent)

  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    checkIntentForPushNotificationClick(intent)
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick {}
  }

}
