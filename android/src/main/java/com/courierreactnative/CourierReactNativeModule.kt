package com.courierreactnative

import android.content.Intent
import com.courier.android.*
import com.courier.android.models.CourierAgent
import com.courier.android.models.CourierProvider
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject


class CourierReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val COURIER_MODULE_NAME = "CourierReactNative"
    private const val COURIER_ERROR_TAG = "Courier Android SDK Error"
    private const val COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT = "courierDebugEvent"
    private const val COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked"
  }

  init {
    // User Agent is used to ensure we know the SDK
    // the requests come from
    Courier.USER_AGENT = CourierAgent.REACT_NATIVE_ANDROID

    Courier.shared.logListener = { data ->
      sendEvent(reactContext, COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT, data)
    }

  }

  override fun getName(): String {
    return COURIER_MODULE_NAME
  }

  private val reactActivity: ReactActivity?
    get() = currentActivity as? ReactActivity

  @ReactMethod
  fun signIn(userId: String, accessToken: String, promise: Promise) {
    Courier.shared.signIn(
      accessToken = accessToken,
      userId = userId,
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun getFcmToken(promise: Promise) {
    try {
      val token = Courier.shared.fcmToken
      promise.resolve(token)
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun setFcmToken(token: String, promise: Promise) {
    Courier.shared.setFCMToken(
      token,
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun getUserId(promise: Promise) {
    try {
      val userId = Courier.shared.userId
      promise.resolve(userId)
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    Courier.shared.signOut(
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun sendPush(
    authKey: String,
    userId: String,
    title: String,
    body: String,
    providers: ReadableArray,
    isProduction: Boolean,
    promise: Promise
  ) {
    Courier.shared.sendPush(
      authKey = authKey,
      userId = userId,
      title = title,
      body = body,
      providers = providers.toCourierProviders(),
      isProduction = isProduction,
      onSuccess = { messageId ->
        promise.resolve(messageId)
      },
      onFailure = { e ->
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun requestNotificationPermission(promise: Promise) {
    try {
      reactActivity?.requestNotificationPermission { isGranted ->
        val status = if (isGranted) NotificationPermissionStatus.AUTHORIZED else NotificationPermissionStatus.DENIED
        promise.resolve(status.value)
      }
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {
    try {
      reactActivity?.getNotificationPermissionStatus { isGranted ->
        val status = if (isGranted) NotificationPermissionStatus.AUTHORIZED else NotificationPermissionStatus.DENIED
        promise.resolve(status.value)
      }
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun registerPushNotificationClickedOnKilledState() {
    reactActivity?.let { activity ->
      checkIntentForPushNotificationClick(activity.intent)
    }
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    sendEvent(
      reactApplicationContext,
      COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
      JSONObject(message.pushNotification).toString()
    )
  }

  @ReactMethod
  fun setDebugMode(isDebugging: Boolean, promise: Promise) {
    try {
      Courier.shared.isDebugging = isDebugging
      promise.resolve(Courier.shared.isDebugging)
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: String) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun ReadableArray.toCourierProviders(): List<CourierProvider> {
    val providers: MutableList<CourierProvider> = mutableListOf()
    for (provider in toArrayList()) {
      CourierProvider.values().forEach {
        if (it.value == provider) {
          providers.add(it)
        }
      }
    }
    return providers
  }

}
