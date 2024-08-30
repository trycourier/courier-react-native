package com.courierreactnative

import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.courier.android.ui.CourierStyles
import com.courier.android.ui.inbox.CourierInbox
import com.courier.android.ui.inbox.CourierInboxTheme
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

internal class CourierReactNativeInboxView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0) : CourierInbox(context, attrs, defStyleAttr) {

  override fun requestLayout() {
    super.requestLayout()
    post(measureAndLayout)
  }

  private val measureAndLayout = Runnable {
    measure(
      MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
    )
    layout(left, top, right, bottom)
  }

}

class CourierInboxViewManager : SimpleViewManager<CourierInbox>() {

  private var themedReactContext: ThemedReactContext? = null

  private companion object {
    const val ON_CLICK_MESSAGE_AT_INDEX = "courierClickMessageAtIndex"
    const val ON_CLICK_ACTION_AT_INDEX = "courierClickActionAtIndex"
    const val ON_SCROLL = "courierScrollInbox"
  }

  override fun getName() = "CourierInboxView"

  override fun createViewInstance(reactContext: ThemedReactContext): CourierInbox {
    themedReactContext = reactContext
    return CourierReactNativeInboxView(reactContext)
  }

  @ReactProp(name = "onClickInboxMessageAtIndex")
  fun setOnClickInboxMessageAtIndex(view: CourierInbox, callback: Boolean) {

    view.setOnClickMessageListener { message, index ->
      val map = Arguments.createMap()
      map.putString("message", message.toJson())
      map.putInt("index", index)
      themedReactContext?.sendEvent(ON_CLICK_MESSAGE_AT_INDEX, map)
    }

  }

  @ReactProp(name = "onClickInboxActionForMessageAtIndex")
  fun setOnClickInboxActionForMessageAtIndex(view: CourierInbox, callback: Boolean) {

    view.setOnClickActionListener { action, message, index ->
      val map = Arguments.createMap()
      map.putMap("action", action.toWritableMap())
      map.putString("message", message.toJson())
      map.putInt("index", index)
      themedReactContext?.sendEvent(ON_CLICK_ACTION_AT_INDEX, map)
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

      themedReactContext?.sendEvent(ON_SCROLL, map)

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

    val brandId = getString("brandId")

    val unreadIndicatorStyle = getMap("unreadIndicatorStyle")
    val loadingIndicatorColor = getString("loadingIndicatorColor")

    val titleStyle = getMap("titleStyle")
    val timeStyle = getMap("timeStyle")
    val bodyStyle = getMap("bodyStyle")
    val infoViewStyle = getMap("infoViewStyle")
    val buttonStyles = getMap("buttonStyles")

    val context = view.context

    return CourierInboxTheme(
      brandId = brandId,
      unreadIndicatorStyle = unreadIndicatorStyle?.toUnreadIndicatorStyle() ?: CourierStyles.Inbox.UnreadIndicatorStyle(),
      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
      titleStyle = titleStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
        unread = CourierStyles.Font(),
        read = CourierStyles.Font(),
      ),
      timeStyle = timeStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
        unread = CourierStyles.Font(),
        read = CourierStyles.Font(),
      ),
      bodyStyle = bodyStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
        unread = CourierStyles.Font(),
        read = CourierStyles.Font(),
      ),
      buttonStyle = buttonStyles?.toButtonStyle(context) ?: CourierStyles.Inbox.ButtonStyle(
        unread = CourierStyles.Button(),
        read = CourierStyles.Button(),
      ),
      infoViewStyle = infoViewStyle?.toInfoViewStyle(context) ?: CourierStyles.InfoViewStyle(
        font = CourierStyles.Font(),
        button = CourierStyles.Button(),
      ),
      dividerItemDecoration = dividerItemDecoration?.toDivider(context),
    )

  }

  private fun ReadableMap.toTextStyle(context: Context): CourierStyles.Inbox.TextStyle {

    val unread = getMap("unread")
    val read = getMap("read")

    return CourierStyles.Inbox.TextStyle(
      unread = unread?.toFont(context) ?: CourierStyles.Font(),
      read = read?.toFont(context) ?: CourierStyles.Font(),
    )

  }

  private fun ReadableMap.toUnreadIndicatorStyle(): CourierStyles.Inbox.UnreadIndicatorStyle {

    val indicator = getString("indicator")
    val color = getString("color")

    var style = CourierStyles.Inbox.UnreadIndicator.LINE

    if (indicator == "dot") {
      style = CourierStyles.Inbox.UnreadIndicator.DOT
    }

    return CourierStyles.Inbox.UnreadIndicatorStyle(
      indicator = style,
      color = color?.toColor(),
    )

  }

  private fun ReadableMap.toButtonStyle(context: Context): CourierStyles.Inbox.ButtonStyle {

    val unread = getMap("unread")
    val read = getMap("read")

    return CourierStyles.Inbox.ButtonStyle(
      unread = unread?.toButton(context) ?: CourierStyles.Button(),
      read = read?.toButton(context) ?: CourierStyles.Button()
    )

  }

}
