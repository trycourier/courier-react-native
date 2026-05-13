package com.courierreactnative

import android.app.Activity
import com.courier.android.Courier
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

abstract class ReactNativeModule(val tag: String, private val name: String, reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext)  {

  override fun getName() = name

  val activity: Activity? get() = reactApplicationContext.currentActivity

  init {
    Courier.agent = Utils.COURIER_AGENT
  }

  internal fun Promise.rejectMissingContext() {
    reject("Missing Context", tag, null)
  }

  internal fun Promise.rejectMissingClient() {
    reject("Missing Client", tag, null)
  }

  internal fun Promise.apiError(throwable: Throwable) {
    throwable.message?.let { reject(it, tag, throwable) }
  }

}
