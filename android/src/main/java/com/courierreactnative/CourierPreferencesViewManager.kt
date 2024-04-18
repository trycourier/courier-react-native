package com.courierreactnative

import android.content.Context
import android.util.AttributeSet
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

internal class CourierReactNativePreferencesView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0) : CourierPreferences(context, attrs, defStyleAttr) {

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

class CourierPreferencesViewManager : SimpleViewManager<CourierPreferences>() {

  private companion object {
    const val ON_ERROR = "courierPreferenceError"
  }

  override fun getName() = "CourierPreferencesView"

  override fun createViewInstance(reactContext: ThemedReactContext): CourierPreferences {
    val activity = reactContext.currentActivity as FragmentActivity
    return CourierReactNativePreferencesView(activity)
  }

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

    val brandId = getString("brandId")
    val loadingIndicatorColor = getString("loadingIndicatorColor")
    val sectionTitleFont = getMap("sectionTitleFont")
    val topicTitleFont = getMap("topicTitleFont")
    val topicSubtitleFont = getMap("topicSubtitleFont")
    val sheetTitleFont = getMap("sheetTitleFont")

    val android = getMap("android")
    val topicDividerItemDecoration = android?.getString("topicDividerItemDecoration")
    val sheetDividerItemDecoration = android?.getString("sheetDividerItemDecoration")
    val sheetSettingStyles = android?.getMap("sheetSettingStyles")

    val context = view.context
    val defaultTheme = CourierPreferencesTheme()

    return CourierPreferencesTheme(
      brandId = brandId,
      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
      sectionTitleFont = sectionTitleFont?.toFont(context) ?: defaultTheme.sectionTitleFont,
      topicDividerItemDecoration = topicDividerItemDecoration?.toDivider(context),
      topicTitleFont = topicTitleFont?.toFont(context) ?: defaultTheme.topicTitleFont,
      topicSubtitleFont = topicSubtitleFont?.toFont(context) ?: defaultTheme.topicSubtitleFont,
      sheetTitleFont = sheetTitleFont?.toFont(context) ?: defaultTheme.sheetTitleFont,
      sheetDividerItemDecoration = sheetDividerItemDecoration?.toDivider(context),
      sheetSettingStyles = sheetSettingStyles?.toSheetSettingStyles(context, fallback = defaultTheme.sheetSettingStyles) ?: defaultTheme.sheetSettingStyles
    )

  }

  private fun ReadableMap.toSheetSettingStyles(context: Context, fallback: CourierStyles.Preferences.SettingStyles): CourierStyles.Preferences.SettingStyles {

    val font = getMap("font")
    val toggleThumbColor = getString("toggleThumbColor")
    val toggleTrackColor = getString("toggleTrackColor")

    return CourierStyles.Preferences.SettingStyles(
      font = font?.toFont(context) ?: fallback.font,
      toggleThumbColor = toggleThumbColor?.toColor(),
      toggleTrackColor = toggleTrackColor?.toColor(),
    )

  }

}
