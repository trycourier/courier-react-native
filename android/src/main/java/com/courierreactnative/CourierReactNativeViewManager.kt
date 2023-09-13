package com.courierreactnative

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Handler
import android.view.View
import androidx.recyclerview.widget.DividerItemDecoration
import com.courier.android.inbox.CourierInboxButtonStyles
import com.courier.android.inbox.CourierInboxFont
import com.courier.android.inbox.CourierInboxTheme
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp


class CourierReactNativeViewManager : SimpleViewManager<ReactNativeCourierInbox>() {

  private companion object {
    const val ON_CLICK_MESSAGE_AT_INDEX = "courierClickMessageAtIndex"
    const val ON_CLICK_ACTION_AT_INDEX = "courierClickActionAtIndex"
    const val ON_SCROLL = "courierScrollInbox"
  }

  override fun getName() = "CourierReactNativeView"

  override fun createViewInstance(reactContext: ThemedReactContext): ReactNativeCourierInbox = ReactNativeCourierInbox(reactContext)

  private val View.reactContext: ThemedReactContext get() = context as ThemedReactContext

  @ReactProp(name = "onClickInboxMessageAtIndex")
  fun setOnClickInboxMessageAtIndex(view: ReactNativeCourierInbox, callback: Boolean) {

    view.inbox.setOnClickMessageListener { message, index ->

      val map = Arguments.createMap()
      map.putMap("message", message.toWritableMap())
      map.putInt("index", index)

      view.reactContext.sendEvent(ON_CLICK_MESSAGE_AT_INDEX, map)

    }

  }

  @ReactProp(name = "onClickInboxActionForMessageAtIndex")
  fun setOnClickInboxActionForMessageAtIndex(view: ReactNativeCourierInbox, callback: Boolean) {

    view.inbox.setOnClickActionListener { action, message, index ->

      val map = Arguments.createMap()
      map.putMap("action", action.toWritableMap())
      map.putMap("message", message.toWritableMap())
      map.putInt("index", index)

      view.reactContext.sendEvent(ON_CLICK_ACTION_AT_INDEX, map)

    }

  }

  @ReactProp(name = "onScrollInbox")
  fun setOnScrollInbox(view: ReactNativeCourierInbox, callback: Boolean) {

    view.inbox.setOnScrollInboxListener { offsetInDp ->

      val offset = Arguments.createMap()
      offset.putInt("y", offsetInDp)
      offset.putInt("x", 0)

      val map = Arguments.createMap()
      map.putMap("contentOffset", offset)

      view.reactContext.sendEvent(ON_SCROLL, map)

    }

  }

  @ReactProp(name = "theme")
  fun setTheme(view: ReactNativeCourierInbox, theme: ReadableMap) {
    view.inbox.lightTheme = theme.getMap("light")?.toTheme(view) ?: CourierInboxTheme.DEFAULT_LIGHT
    view.inbox.darkTheme = theme.getMap("dark")?.toTheme(view) ?: CourierInboxTheme.DEFAULT_DARK
  }

  private fun ReadableMap.toTheme(view: View): CourierInboxTheme {

    val android = getMap("android")
    val dividerItemDecoration = android?.getString("dividerItemDecoration")

    val unreadIndicatorBarColor = getString("unreadIndicatorBarColor")
    val loadingIndicatorColor = getString("loadingIndicatorColor")

    val titleFont = getMap("titleFont")
    val timeFont = getMap("timeFont")
    val bodyFont = getMap("bodyFont")
    val detailTitleFont = getMap("detailTitleFont")
    val buttonStyles = getMap("buttonStyles")

    val context = view.context

    return CourierInboxTheme(
      dividerItemDecoration = dividerItemDecoration?.toDivider(context),
      unreadIndicatorBarColor = unreadIndicatorBarColor?.toColor(),
      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
      titleFont = titleFont?.toFont(context) ?: CourierInboxFont(),
      timeFont = timeFont?.toFont(context) ?: CourierInboxFont(),
      bodyFont = bodyFont?.toFont(context) ?: CourierInboxFont(),
      detailTitleFont = detailTitleFont?.toFont(context) ?: CourierInboxFont(),
      buttonStyles = buttonStyles?.toButtonStyles(context) ?: CourierInboxButtonStyles()
    )

  }

  private fun String.toColor(): Int = Color.parseColor(this)

  private fun String.toFont(context: Context): Typeface? {
    return try {
      val assetManager = context.assets
      Typeface.createFromAsset(assetManager, this)
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  private fun String.toDivider(context: Context): DividerItemDecoration? = if (this == "vertical") DividerItemDecoration(context, DividerItemDecoration.VERTICAL) else null

  private fun ReadableMap.toFont(context: Context): CourierInboxFont {

    val typeface = getString("family")
    val size = if (isNull("size")) null else getDouble("size")
    val color = getString("color")

    return CourierInboxFont(
        typeface = typeface?.toFont(context),
        color = color?.toColor(),
        sizeInSp = size?.toInt()
      )

  }

  private fun ReadableMap.toButtonStyles(context: Context): CourierInboxButtonStyles {

    val font = getMap("font")
    val backgroundColor = getString("backgroundColor")
    val cornerRadius = if (isNull("cornerRadius")) null else getDouble("cornerRadius")

    return CourierInboxButtonStyles(
      font = font?.toFont(context),
      backgroundColor = backgroundColor?.toColor(),
      cornerRadiusInDp = cornerRadius?.toInt()
    )

  }

}
