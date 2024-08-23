package com.courierreactnative

import com.courier.android.Courier
import com.courier.android.models.CourierAgent
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

abstract class ReactNativeModule(val tag: String, private val name: String, reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext)  {

  override fun getName() = name

  val reactActivity: ReactActivity? get() = currentActivity as? ReactActivity

  init {

    // User Agent is used to ensure we know the SDK
    // the requests come from
    Courier.USER_AGENT = CourierAgent.REACT_NATIVE_ANDROID

  }

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

}
