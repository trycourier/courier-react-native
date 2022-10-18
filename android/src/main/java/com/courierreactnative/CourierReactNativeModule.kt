package com.courierreactnative

import android.content.Intent
import android.util.Log
import com.courier.android.*
import com.courier.android.models.CourierAgent
import com.courier.android.models.CourierProvider
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject


class CourierReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val COURIER_ERROR_TAG = "Courier Android SDK Error";
    private const val COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked";
    private const val COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT = "courierDebugEvent";
  }


  init {
    Courier.initialize(reactContext);
    Courier.USER_AGENT = CourierAgent.REACT_NATIVE_ANDROID
    Courier.shared.logListener = { data ->
      sendEvent(reactContext, COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT, data)
    }

  }

  override fun getName(): String {
    return "CourierReactNative"
  }


  @ReactMethod
  fun signIn(userId: String, accessToken: String, promise: Promise) {

    Log.d("CourierModule", "setCredential invoked \n userId: $userId  \naccessToken: $accessToken")
    Courier.shared.signIn(
      accessToken = accessToken,
      userId = userId,
      onSuccess = {
        val successMessage = "**************** Credentials are set **************"
        println(successMessage)
        promise.resolve(successMessage)
      },
      onFailure = { e ->
        println("************* error message ************ $e")
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun getFcmToken(promise: Promise) {
    try {
      promise.resolve(Courier.shared.fcmToken)
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e);
    }
  }

  @ReactMethod
  fun setFcmToken(token: String, promise: Promise) {
    Courier.shared.setFCMToken(token, onSuccess = {
      promise.resolve("Successfully set fcm token")
    }, onFailure = { e ->
      promise.reject(COURIER_ERROR_TAG, e)
    })
  }

  @ReactMethod
  fun getUserId(promise: Promise) {
    try {
      promise.resolve(Courier.shared.userId)
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e);
    }
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    Courier.shared.signOut(onSuccess = {
      promise.resolve("Signout successful")
    }, onFailure = { e ->
      println("************* error message ************ $e")
      promise.reject(COURIER_ERROR_TAG, e)
    })
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

    val normalizedProviders: MutableList<CourierProvider> = mutableListOf();
    for (provider in providers.toArrayList()) {
      CourierProvider.values().forEach {
        if (it.value == provider) {
          normalizedProviders.add(it);
        }
      }
    }

    Courier.shared.sendPush(
      authKey = authKey,
      userId = userId,
      title = title,
      body = body,
      providers = normalizedProviders,
      isProduction = isProduction,
      onSuccess = {
        val successMessage = "**************** Push sent**************"
        println(successMessage)
        promise.resolve(successMessage)
      },
      onFailure = { e ->
        println("************* push sending failed ************ $e")
        promise.reject(COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun requestNotificationPermission(promise: Promise) {
    try {
      val reactActivity = currentActivity as? ReactActivity
      reactActivity?.requestNotificationPermission { isGranted ->
        val status = if (isGranted) "authorized" else "denied"
        promise.resolve(status)
      }
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {
    try {
      val reactActivity = currentActivity as? ReactActivity
      reactActivity?.getNotificationPermissionStatus { isGranted ->
        val status = if (isGranted) "authorized" else "denied"
        promise.resolve(status)
      }
    } catch (e: Exception) {
      promise.reject(COURIER_ERROR_TAG, e)
    }
  }

  @ReactMethod
  fun registerPushNotificationClickedOnKilledState() {
    val reactActivity = currentActivity as? ReactActivity
    if (reactActivity != null) {
      checkIntentForPushNotificationClick(reactActivity.intent)
    }
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    val convertedMap = Arguments.createMap()
    message.data.forEach { entry ->
      convertedMap.putString(entry.key, entry.value);
    }
    sendEvent(
      reactApplicationContext,
      COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
      JSONObject(message.pushNotification).toString()
    )
  }


  @ReactMethod
  fun setDebugMode(isDebugging: Boolean, promise: Promise) {
    try {
      Courier.shared.isDebugging = isDebugging;
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

}
