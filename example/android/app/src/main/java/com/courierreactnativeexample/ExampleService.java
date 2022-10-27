package com.courierreactnativeexample;

import android.annotation.SuppressLint;

import androidx.annotation.NonNull;

import com.courier.android.notifications.RemoteMessageExtensionsKt;
import com.courier.android.service.CourierService;
import com.google.firebase.messaging.RemoteMessage;

// Warning is suppressed
// You do not need to worry about this warning
// The CourierService will handle the function automatically
@SuppressLint("MissingFirebaseInstanceTokenRefresh")
public class ExampleService extends CourierService {

  @Override
  public void showNotification(@NonNull RemoteMessage message) {
    super.showNotification(message);

    // TODO: This is where you will customize the notification that is shown to your users
    // The function below is used to get started quickly.
    // You likely do not want to use `message.presentNotification(...)`
    // For Flutter, you likely do not want to change the handlingClass
    // More information on how to customize an Android notification here:
    // https://developer.android.com/develop/ui/views/notifications/build-notification
    RemoteMessageExtensionsKt.presentNotification(
      message,
      this,
      MainActivity.class,
      android.R.drawable.ic_dialog_info,
      "Notification Service"
    );

  }

}
