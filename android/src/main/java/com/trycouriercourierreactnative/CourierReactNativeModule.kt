package com.trycouriercourierreactnative

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.courier.android.Courier

class CourierReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {


  init {
    Courier.initialize(reactContext)
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
        promise.reject("error", e)
      }
    )
  }


  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Int, b: Int, promise: Promise) {
    promise.resolve(a * b)
  }

}
