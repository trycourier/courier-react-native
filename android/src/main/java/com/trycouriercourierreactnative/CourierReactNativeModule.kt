package com.trycouriercourierreactnative

import android.util.Log
import com.courier.android.Courier
import com.courier.android.models.CourierProvider
import com.courier.android.requestNotificationPermission
import com.courier.android.sendPush
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule


class CourierReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val COURIER_ERROR_TAG = "Courier Android SDK Error"
  }

  init {
    Courier.initialize(reactContext);
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
    promise: Promise
  ) {

    val courierProviders = providers.toArrayList().map { providerValue ->
      val value = providerValue as String
      return@map CourierProvider.valueOf(value)
    }

    Courier.shared.sendPush(
      authKey = authKey,
      userId = userId,
      title = title,
      body = body,
      providers = courierProviders,
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

  //  TODO: send event to react-native side
  private fun sendEvent(reactContext: ReactContext, eventName: String, params: Int) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

}
