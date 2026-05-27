package com.courierreactnativeexample

import android.annotation.SuppressLint
import com.courier.android.Courier
import com.courier.android.notifications.CourierPushNotificationIntent
import com.courier.android.notifications.presentNotification
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

// Requires Firebase Messaging dependency in your app/build.gradle:
//   implementation(platform("com.google.firebase:firebase-bom:<version>"))
//   implementation("com.google.firebase:firebase-messaging")
class ExampleService : FirebaseMessagingService() {

  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)

    // Notify the Courier SDK that a push was delivered
    Courier.onMessageReceived(message.data)

    // Create the PendingIntent that runs when the user taps the notification
    // This intent targets your Activity and carries the original message payload
    // TODO: Remove this if you'd like. This is mostly useful for demo purposes.
    val notificationIntent = CourierPushNotificationIntent(
      this,
      0,
      MainActivity::class.java,
      message
    )

    // Show the notification to the user.
    // Prefer data-only FCM so this service runs even in background/killed state.
    // Fall back to notification fields if data keys are missing.
    // TODO: Remove this if you'd like. This is mostly useful for demo purposes.
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

    // Register/refresh this device's FCM token with Courier.
    // The SDK caches and updates the token automatically and links it to the current user.
    Courier.onNewToken(token)
  }
}
