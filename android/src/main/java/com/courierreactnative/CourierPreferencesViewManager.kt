package com.courierreactnative

import android.content.Context
import android.view.View
import androidx.fragment.app.FragmentActivity
import com.courier.android.models.CourierPreferenceChannel
import com.courier.android.ui.CourierStyles
import com.courier.android.ui.preferences.CourierPreferences
import com.courier.android.ui.preferences.CourierPreferencesTheme
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp


class CourierPreferencesViewManager : SimpleViewManager<CourierPreferences>() {

  private companion object {
    const val ON_ERROR = "courierPreferenceError"
  }

  override fun getName() = "CourierPreferencesView"

  override fun createViewInstance(reactContext: ThemedReactContext): CourierPreferences {

    val activity = reactContext.currentActivity as FragmentActivity
    val preferences = CourierPreferences(activity)

//    Choreographer.getInstance().postFrameCallback(object: Choreographer.FrameCallback {
//      override fun doFrame(frameTimeNanos: Long) {
//        traverseViewTree(preferences)
////        preferences.viewTreeObserver.dispatchOnGlobalLayout()
//        Choreographer.getInstance().postFrameCallback(this)
//      }
//    })

//    preferences.doOnLayout {
//      preferences.viewTreeObserver.dispatchOnGlobalLayout()
//    }

    return preferences

  }

//  fun traverseViewTree(view: View) {
//    // Do something with the current view
//    // For example, you can access its properties or perform some operations
//
//    if (view is ViewGroup) {
//      for (i in 0 until view.childCount) {
//        val childView = view.getChildAt(i)
////        childView.requestLayout()
//        traverseViewTree(childView)
//      }
//    }
//  }

  private val View.reactContext: ThemedReactContext get() = context as ThemedReactContext

  @ReactProp(name = "onPreferenceError")
  fun setOnPreferenceError(view: CourierPreferences, callback: Boolean) {
    view.onError = { error ->
      val map = Arguments.createMap()
      map.putString("error", error.message)
      view.reactContext.sendEvent(ON_ERROR, map)
    }
  }

  @ReactProp(name = "mode")
  fun setMode(view: CourierPreferences, theme: ReadableMap) {
    view.mode = theme.toMode()
  }

  @ReactProp(name = "theme")
  fun setTheme(view: CourierPreferences, theme: ReadableMap) {
    view.lightTheme = theme.getMap("light")?.toTheme(view) ?: CourierPreferencesTheme.DEFAULT_LIGHT
    view.darkTheme = theme.getMap("dark")?.toTheme(view) ?: CourierPreferencesTheme.DEFAULT_DARK
  }

  private fun ReadableMap.toMode(): CourierPreferences.Mode {

    val type = getString("type")

    if (type == "channels") {
      val rawChannels = getArray("channels")?.toArrayList()?.toList() ?: emptyList()
      val channels = rawChannels.map { CourierPreferenceChannel.fromString(it.toString()) }
      return CourierPreferences.Mode.Channels(channels)
    }

    return CourierPreferences.Mode.Topic

  }

  private fun ReadableMap.toTheme(view: CourierPreferences): CourierPreferencesTheme {

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

    return CourierPreferencesTheme(
      brandId = brandId,
//      unreadIndicatorStyle = unreadIndicatorStyle?.toUnreadIndicatorStyle() ?: CourierStyles.Inbox.UnreadIndicatorStyle(),
//      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
//      titleStyle = titleStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
//        unread = CourierStyles.Font(),
//        read = CourierStyles.Font(),
//      ),
//      timeStyle = timeStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
//        unread = CourierStyles.Font(),
//        read = CourierStyles.Font(),
//      ),
//      bodyStyle = bodyStyle?.toTextStyle(context) ?: CourierStyles.Inbox.TextStyle(
//        unread = CourierStyles.Font(),
//        read = CourierStyles.Font(),
//      ),
//      buttonStyle = buttonStyles?.toButtonStyle(context) ?: CourierStyles.Inbox.ButtonStyle(
//        unread = CourierStyles.Button(),
//        read = CourierStyles.Button(),
//      ),
//      infoViewStyle = infoViewStyle?.toInfoViewStyle(context) ?: CourierStyles.InfoViewStyle(
//        font = CourierStyles.Font(),
//        button = CourierStyles.Button(),
//      ),
//      dividerItemDecoration = dividerItemDecoration?.toDivider(context),
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
