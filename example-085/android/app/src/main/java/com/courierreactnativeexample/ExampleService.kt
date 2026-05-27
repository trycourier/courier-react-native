package com.courierreactnativeexample

import android.annotation.SuppressLint
import com.courier.android.Courier
import com.courier.android.notifications.CourierPushNotificationIntent
import com.courier.android.notifications.presentNotification
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

@SuppressLint("MissingFirebaseInstanceTokenRefresh")
class ExampleService : FirebaseMessagingService() {

  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)

    Courier.onMessageReceived(message.data)

    val notificationIntent = CourierPushNotificationIntent(
      this,
      0,
      MainActivity::class.java,
      message
    )

    val title = message.data["title"] ?: message.notification?.title
    val body = message.data["body"] ?: message.notification?.body

    notificationIntent.presentNotification(
      title,
      body,
      android.R.drawable.ic_dialog_info,
      "Notification Service"
    )
  }

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    Courier.onNewToken(token)
  }
}
