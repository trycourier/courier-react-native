package com.courierreactnative

import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import com.courier.android.inbox.CourierInbox
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class CourierReactNativeViewManager : SimpleViewManager<FrameLayout>() {

  override fun getName() = "CourierReactNativeView"

  override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
    return FrameLayout(reactContext)
  }

  @ReactProp(name = "theme")
  fun setTheme(view: FrameLayout, theme: ReadableMap) {

    view.removeAllViews()

    // Create the view
    val courierInbox = CourierInbox(view.context)

    // Set the layout params
    val layoutParams = FrameLayout.LayoutParams(
      FrameLayout.LayoutParams.MATCH_PARENT,
      FrameLayout.LayoutParams.MATCH_PARENT
    )
    courierInbox.layoutParams = layoutParams

    // Add the view to the parent
    view.addView(courierInbox)

    view.setBackgroundColor(Color.parseColor(theme.getString("color")))

  }

}
