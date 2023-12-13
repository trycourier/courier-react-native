package com.courierreactnative

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import androidx.recyclerview.widget.DividerItemDecoration
import com.courier.android.inbox.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp


class CourierReactNativeViewManager : SimpleViewManager<CourierInbox>() {

  private companion object {
    const val ON_CLICK_MESSAGE_AT_INDEX = "courierClickMessageAtIndex"
    const val ON_CLICK_ACTION_AT_INDEX = "courierClickActionAtIndex"
    const val ON_SCROLL = "courierScrollInbox"
  }

  override fun getName() = "CourierReactNativeView"

  override fun createViewInstance(reactContext: ThemedReactContext): CourierInbox = CourierInbox(reactContext)

  private val View.reactContext: ThemedReactContext get() = context as ThemedReactContext

  @ReactProp(name = "onClickInboxMessageAtIndex")
  fun setOnClickInboxMessageAtIndex(view: CourierInbox, callback: Boolean) {

    view.setOnClickMessageListener { message, index ->

      val map = Arguments.createMap()
      map.putMap("message", message.toWritableMap())
      map.putInt("index", index)

      view.reactContext.sendEvent(ON_CLICK_MESSAGE_AT_INDEX, map)

    }

  }

  @ReactProp(name = "onClickInboxActionForMessageAtIndex")
  fun setOnClickInboxActionForMessageAtIndex(view: CourierInbox, callback: Boolean) {

    view.setOnClickActionListener { action, message, index ->

      val map = Arguments.createMap()
      map.putMap("action", action.toWritableMap())
      map.putMap("message", message.toWritableMap())
      map.putInt("index", index)

      view.reactContext.sendEvent(ON_CLICK_ACTION_AT_INDEX, map)

    }

  }

  @ReactProp(name = "onScrollInbox")
  fun setOnScrollInbox(view: CourierInbox, callback: Boolean) {

    view.setOnScrollInboxListener { offsetInDp ->

      val offset = Arguments.createMap()
      offset.putInt("y", offsetInDp)
      offset.putInt("x", 0)

      val map = Arguments.createMap()
      map.putMap("contentOffset", offset)

      view.reactContext.sendEvent(ON_SCROLL, map)

    }

  }

  @ReactProp(name = "theme")
  fun setTheme(view: CourierInbox, theme: ReadableMap) {
    view.lightTheme = theme.getMap("light")?.toTheme(view) ?: CourierInboxTheme.DEFAULT_LIGHT
    view.darkTheme = theme.getMap("dark")?.toTheme(view) ?: CourierInboxTheme.DEFAULT_DARK
  }

  private fun ReadableMap.toTheme(view: View): CourierInboxTheme {

    val android = getMap("android")
    val dividerItemDecoration = android?.getString("dividerItemDecoration")

    val unreadIndicatorStyle = getMap("unreadIndicatorStyle")
    val loadingIndicatorColor = getString("loadingIndicatorColor")

    val titleStyle = getMap("titleStyle")
    val timeStyle = getMap("timeStyle")
    val bodyStyle = getMap("bodyStyle")
    val infoViewStyle = getMap("infoViewStyle")
    val buttonStyles = getMap("buttonStyles")

    val context = view.context

    return CourierInboxTheme(
      unreadIndicatorStyle = unreadIndicatorStyle?.toUnreadIndicatorStyle() ?: CourierInboxUnreadIndicatorStyle(),
      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
      titleStyle = titleStyle?.toTextStyle(context) ?: CourierInboxTextStyle(
        unread = CourierInboxFont(),
        read = CourierInboxFont(),
      ),
      timeStyle = timeStyle?.toTextStyle(context) ?: CourierInboxTextStyle(
        unread = CourierInboxFont(),
        read = CourierInboxFont(),
      ),
      bodyStyle = bodyStyle?.toTextStyle(context) ?: CourierInboxTextStyle(
        unread = CourierInboxFont(),
        read = CourierInboxFont(),
      ),
      buttonStyle = buttonStyles?.toButtonStyle(context) ?: CourierInboxButtonStyle(
        unread = CourierInboxButton(),
        read = CourierInboxButton(),
      ),
      infoViewStyle = infoViewStyle?.toInfoStyle(context) ?: CourierInboxInfoViewStyle(
        font = CourierInboxFont(),
        button = CourierInboxButton(),
      ),
      dividerItemDecoration = dividerItemDecoration?.toDivider(context),
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

  private fun ReadableMap.toTextStyle(context: Context): CourierInboxTextStyle {

    val unread = getMap("unread")
    val read = getMap("read")

    return CourierInboxTextStyle(
      unread = unread?.toFont(context) ?: CourierInboxFont(),
      read = read?.toFont(context) ?: CourierInboxFont(),
    )

  }

  private fun ReadableMap.toUnreadIndicatorStyle(): CourierInboxUnreadIndicatorStyle {

    val indicator = getString("indicator")
    val color = getString("color")

    var style = CourierInboxUnreadIndicator.LINE

    if (indicator == "dot") {
      style = CourierInboxUnreadIndicator.DOT
    }

    return CourierInboxUnreadIndicatorStyle(
      indicator = style,
      color = color?.toColor(),
    )

  }

  private fun ReadableMap.toButton(context: Context): CourierInboxButton {

    val font = getMap("font")
    val backgroundColor = getString("backgroundColor")
    val cornerRadius = if (isNull("cornerRadius")) null else getDouble("cornerRadius")

    return CourierInboxButton(
      font = font?.toFont(context),
      backgroundColor = backgroundColor?.toColor(),
      cornerRadiusInDp = cornerRadius?.toInt()
    )

  }

  private fun ReadableMap.toButtonStyle(context: Context): CourierInboxButtonStyle {

    val unread = getMap("unread")
    val read = getMap("read")

    return CourierInboxButtonStyle(
      unread = unread?.toButton(context) ?: CourierInboxButton(),
      read = read?.toButton(context) ?: CourierInboxButton()
    )

  }

  private fun ReadableMap.toInfoStyle(context: Context): CourierInboxInfoViewStyle {

    val font = getMap("font")
    val button = getMap("button")

    return CourierInboxInfoViewStyle(
      font = font?.toFont(context) ?: CourierInboxFont(),
      button = button?.toButton(context) ?: CourierInboxButton()
    )

  }

}
