package com.courierreactnative

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import androidx.recyclerview.widget.DividerItemDecoration
import com.courier.android.models.CourierAgent
import com.courier.android.ui.CourierStyles
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.gson.GsonBuilder

internal object Utils {
  val COURIER_AGENT = CourierAgent.ReactNativeAndroid(version = "5.2.2")
}

internal fun ReactContext.sendEvent(eventName: String, value: Any?) {
  getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(eventName, value)
}

internal fun String.toDivider(context: Context): DividerItemDecoration? = if (this == "vertical") DividerItemDecoration(context, DividerItemDecoration.VERTICAL) else null

internal fun String.toColor(): Int = Color.parseColor(this)

internal fun String.toFont(context: Context): Typeface? {
  return try {
    val assetManager = context.assets
    Typeface.createFromAsset(assetManager, this)
  } catch (e: Exception) {
    e.printStackTrace()
    null
  }
}

internal fun ReadableMap.toFont(context: Context): CourierStyles.Font {

  val typeface = getString("family")
  val size = if (isNull("size")) null else getDouble("size")
  val color = getString("color")

  return CourierStyles.Font(
    typeface = typeface?.toFont(context),
    color = color?.toColor(),
    sizeInSp = size?.toInt()
  )

}

internal fun ReadableMap.toButton(context: Context): CourierStyles.Button {

  val font = getMap("font")
  val backgroundColor = getString("backgroundColor")
  val cornerRadius = if (isNull("cornerRadius")) null else getDouble("cornerRadius")

  return CourierStyles.Button(
    font = font?.toFont(context),
    backgroundColor = backgroundColor?.toColor(),
    cornerRadiusInDp = cornerRadius?.toInt()
  )

}

internal fun ReadableMap.toInfoViewStyle(context: Context): CourierStyles.InfoViewStyle {

  val font = getMap("font")
  val button = getMap("button")

  return CourierStyles.InfoViewStyle(
    font = font?.toFont(context) ?: CourierStyles.Font(),
    button = button?.toButton(context) ?: CourierStyles.Button()
  )

}

internal fun Map<String, Any>?.toWritableMap(): WritableMap {
  val map = Arguments.createMap()
  this?.forEach { (key, value) ->
    when (value) {
      is String -> map.putString(key, value)
      is Int -> map.putInt(key, value)
      is Double -> map.putDouble(key, value)
      is Boolean -> map.putBoolean(key, value)
      is Map<*, *> -> map.putMap(key, (value as? Map<String, Any>).toWritableMap())
      is List<*> -> map.putArray(key, (value as? List<Any>).toWritableArray())
      else -> map.putNull(key)
    }
  }
  return map
}

internal fun List<Any>?.toWritableArray(): WritableArray {
  val array = Arguments.createArray()
  this?.forEach { item ->
    when (item) {
      is String -> array.pushString(item)
      is Int -> array.pushInt(item)
      is Double -> array.pushDouble(item)
      is Boolean -> array.pushBoolean(item)
      is Map<*, *> -> array.pushMap((item as? Map<String, Any>).toWritableMap())
      is List<*> -> array.pushArray((item as? List<Any>).toWritableArray())
      else -> array.pushNull()
    }
  }
  return array
}

internal fun Any.toJson(): String {
  return GsonBuilder().setPrettyPrinting().create().toJson(this)
}
