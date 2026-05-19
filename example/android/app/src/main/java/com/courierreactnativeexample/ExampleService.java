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

    Courier.Companion.onMessageReceived(message.getData());

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
    Courier.Companion.onNewToken(token);
  }

}
