package com.courierreactnativeexample

import com.courier.android.Courier
import com.courier.android.notifications.CourierPushNotificationIntent
import com.courier.android.notifications.presentNotification
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

// This is a working FirebaseMessagingService used by the example app.
// Only two Courier SDK calls are required to integrate push tracking:
//   1. Courier.onMessageReceived(...)   — in onMessageReceived
//   2. Courier.onNewToken(...)          — in onNewToken
//
// Everything below those calls (CourierPushNotificationIntent, presentNotification)
// is demo code that puts a basic notification on screen for testing.
// In a production app you would replace that block with your own
// NotificationCompat.Builder implementation.
//
// Docs:
//   Courier React Native SDK  — https://www.courier.com/docs/sdk-libraries/react-native/
//   Courier Android SDK       — https://www.courier.com/docs/sdk-libraries/android
//   Android notifications     — https://developer.android.com/develop/ui/views/notifications/build-notification
//
// Requires Firebase Messaging dependency in your app/build.gradle:
//   implementation(platform("com.google.firebase:firebase-bom:<version>"))
//   implementation("com.google.firebase:firebase-messaging")
class ExampleService : FirebaseMessagingService() {

  override fun onMessageReceived(message: RemoteMessage) {
    super.onMessageReceived(message)

    // Required — Tells the Courier SDK a push was delivered.
    // Behind the scenes this posts the trackingUrl from the FCM data payload
    // as a DELIVERED event so delivery analytics appear in the Courier dashboard,
    // and fires any onPushDelivered listeners registered from the JS layer.
    Courier.onMessageReceived(message.data)

    // --- Demo notification code (replace with your own for production) -----------
    //
    // CourierPushNotificationIntent is a convenience wrapper that bundles the
    // RemoteMessage into a PendingIntent. When the user taps the notification,
    // Courier can fire onPushNotificationClicked and track a CLICKED event.
    // In your own app you can build the PendingIntent yourself and call
    // Courier.shared.client.tracking.postTrackingUrl(...) on tap instead.
    val notificationIntent = CourierPushNotificationIntent(
      this,
      0,
      MainActivity::class.java,
      message
    )

    // presentNotification is a Courier helper that posts a basic notification
    // via NotificationManagerCompat. It is fine for testing but not customizable
    // enough for production — use NotificationCompat.Builder directly:
    // https://developer.android.com/develop/ui/views/notifications/build-notification
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

    // Required — Syncs this device's FCM token with Courier.
    // Behind the scenes the SDK caches the token locally and uploads it to
    // Courier linked to the currently signed-in user. If no user is signed in
    // yet the token is held locally and synced on the next signIn() call.
    Courier.onNewToken(token)
  }
}
