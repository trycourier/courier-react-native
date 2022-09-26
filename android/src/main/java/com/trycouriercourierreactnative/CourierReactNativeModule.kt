package com.trycouriercourierreactnative

import android.util.Log
import com.courier.android.Courier
import com.courier.android.models.CourierProvider
import com.courier.android.sendPush
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class CourierReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

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
        promise.reject("error", e)
      }
    )
  }

  @ReactMethod
  fun getFcmToken(promise: Promise) {
    if (Courier.shared.fcmToken == null) {
      promise.reject("error", "Fcm token not found")
    } else {
      promise.resolve(Courier.shared.fcmToken)
    }
  }

  @ReactMethod
  fun getUserId(promise: Promise) {
    if (Courier.shared.userId == null) {
      promise.reject("error", "UserId token not found")
    } else {
      promise.resolve(Courier.shared.userId)
    }
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    Courier.shared.signOut(onSuccess = {
      promise.resolve("Signout successful")
    }, onFailure = { e ->
      println("************* error message ************ $e")
      promise.reject("error", e)
    })
  }

  @ReactMethod
  fun sendPush(authKey: String, userId: String, title: String, body:String, promise: Promise){
    Courier.shared.sendPush(
      authKey=authKey,
      userId=userId,
      title=title,
      body=body,
      providers = listOf(CourierProvider.FCM),
      onSuccess = {
        val successMessage = "**************** Push sent**************"
        println(successMessage)
        promise.resolve(successMessage)
      },
      onFailure = { e ->
        println("************* push sending failed ************ $e")
        promise.reject("error", e)
      }
    )
  }

  //  TODO: send event to react-native side
  private fun sendEvent(reactContext: ReactContext, eventName: String, params: Int) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

}
