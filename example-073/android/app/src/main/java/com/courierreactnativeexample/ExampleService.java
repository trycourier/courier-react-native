package com.courierreactnativeexample;

import androidx.annotation.NonNull;
import com.courier.android.Courier;
import com.courier.android.notifications.CourierPushNotificationIntent;
import com.courier.android.notifications.RemoteMessageExtensionsKt;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class ExampleService extends FirebaseMessagingService {

  @Override
  public void onMessageReceived(@NonNull RemoteMessage message) {
    super.onMessageReceived(message);

    // Notify the Courier SDK that a push was delivered
    Courier.Companion.onMessageReceived(message.getData());

    // Create the PendingIntent that runs when the user taps the notification
    // This intent targets your Activity and carries the original message payload
    // TODO: Remove this if you'd like. This is mostly useful for demo purposes.
    CourierPushNotificationIntent notificationIntent = new CourierPushNotificationIntent(
      this,
      0,
      MainActivity.class,
      message
    );

    String title = message.getData().get("title");
    if (title == null && message.getNotification() != null) {
      title = message.getNotification().getTitle();
    }

    String body = message.getData().get("body");
    if (body == null && message.getNotification() != null) {
      body = message.getNotification().getBody();
    }

    // Show the notification to the user.
    // Prefer data-only FCM so this service runs even in background/killed state.
    // Fall back to notification fields if data keys are missing.
    // TODO: Remove this if you'd like. This is mostly useful for demo purposes.
    RemoteMessageExtensionsKt.presentNotification(
      notificationIntent,
      title,
      body,
      android.R.drawable.ic_dialog_info,
      "Notification Service"
    );
  }

  @Override
  public void onNewToken(@NonNull String token) {
    super.onNewToken(token);

    // Register/refresh this device’s FCM token with Courier.
    // The SDK caches and updates the token automatically and links it to the current user.
    Courier.Companion.onNewToken(token);
    
  }

}
