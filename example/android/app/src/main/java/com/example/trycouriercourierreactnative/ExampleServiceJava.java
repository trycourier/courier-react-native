package com.example.trycouriercourierreactnative;

import androidx.annotation.NonNull;

import com.courier.android.notifications.RemoteMessageExtensionsKt;
import com.courier.android.service.CourierService;
import com.google.firebase.messaging.RemoteMessage;

public class ExampleServiceJava extends CourierService {
  @Override
  public void showNotification(@NonNull RemoteMessage message) {
    super.showNotification(message);

    RemoteMessageExtensionsKt.presentNotification(
      message,
      this,
      MainActivity.class,
      android.R.drawable.ic_dialog_info,
      "Notification Service"
    );
  }
}
