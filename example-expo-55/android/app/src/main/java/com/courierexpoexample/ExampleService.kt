package com.courierexpoexample

import android.annotation.SuppressLint
import com.courier.android.notifications.presentNotification
import com.courier.android.service.CourierService
import com.google.firebase.messaging.RemoteMessage

@SuppressLint("MissingFirebaseInstanceTokenRefresh")
class ExampleService : CourierService() {

  override fun showNotification(message: RemoteMessage) {
    super.showNotification(message)

    message.presentNotification(
      context = this,
      handlingClass = MainActivity::class.java,
      icon = android.R.drawable.ic_dialog_info,
      title = "Notification Service"
    )
  }
}
