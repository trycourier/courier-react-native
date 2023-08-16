package com.courierreactnative

import android.graphics.Color
import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class CourierReactNativeViewManager : SimpleViewManager<View>() {

  override fun getName() = "CourierReactNativeView"

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    return View(reactContext)
  }

  @ReactProp(name = "theme")
  fun setTheme(view: View, theme: ReadableMap) {
    val test = 123
//    view.setBackgroundColor(Color.parseColor(color))
  }

}
