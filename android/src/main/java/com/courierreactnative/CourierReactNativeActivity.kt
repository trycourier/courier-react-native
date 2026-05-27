package com.courierreactnative

import android.content.Intent
import android.os.Bundle
import com.courier.android.Courier
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.ReactActivity

open class CourierReactNativeActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {

    Courier.agent = Utils.COURIER_AGENT
    Courier.initialize(this)

    super.onCreate(savedInstanceState)

    checkIntentForPushNotificationClick(intent)

  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    checkIntentForPushNotificationClick(intent)
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    // The Courier SDK broadcasts a CLICKED event via Courier.onPushNotificationEvent
    // which is observed in CourierSystemModule. No need to reach into the React
    // context here, which would crash on Bridgeless / cold start.
    intent?.trackPushNotificationClick {}
  }

}
