package com.courierreactnativeexample

import com.courierreactnative.CourierReactNativeActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : CourierReactNativeActivity() {

  override fun getMainComponentName(): String = "CourierReactNativeExample"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
