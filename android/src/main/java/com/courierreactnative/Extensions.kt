package com.courierreactnative

import com.courier.android.models.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

internal fun ReactContext.sendEvent(eventName: String, value: Any?) {
  getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(eventName, value)
}

internal fun CourierUserPreferences.toWritableMap(): WritableMap {

  val map = Arguments.createMap()

  val itemsArray = Arguments.createArray()
  items.forEach { topic ->
    itemsArray.pushMap(topic.toWritableMap())
  }
  map.putArray("items", itemsArray)

  map.putMap("paging", paging.toWritableMap())

  return map

}

internal fun CourierPreferenceTopic.toWritableMap(): WritableMap {

  val map = Arguments.createMap()
  map.putString("defaultStatus", defaultStatus.value)
  map.putBoolean("hasCustomRouting", hasCustomRouting)
  map.putString("status", status.value)
  map.putString("topicId", topicId)
  map.putString("topicName", topicName)

  val actionsArray = Arguments.createArray()
  customRouting.forEach { routing ->
    actionsArray.pushString(routing.value)
  }
  map.putArray("customRouting", actionsArray)

  return map

}

internal fun Paging.toWritableMap(): WritableMap {

  val map = Arguments.createMap()

  cursor?.let {
    map.putString("cursor", it)
  }

  map.putBoolean("more", more)

  return map

}

@JvmName("toWritableArrayInboxMessage")
internal fun List<InboxMessage>.toWritableArray(): WritableArray {

  val messagesArray = Arguments.createArray()

  forEach { message ->
    messagesArray.pushMap(message.toWritableMap())
  }

  return messagesArray

}

internal fun InboxMessage.toWritableMap(): WritableMap {

  val map = Arguments.createMap()
  map.putString("messageId", messageId)
  map.putString("title", title)
  map.putString("body", body)
  map.putString("preview", preview)
  map.putString("created", created)

  actions?.let { actionList ->
    val actionsArray = Arguments.createArray()
    actionList.forEach { action ->
      actionsArray.pushMap(action.toWritableMap())
    }
    map.putArray("actions", actionsArray)
  }

  map.putMap("data", data.toWritableMap())
  map.putBoolean("read", isRead)
  map.putBoolean("opened", isOpened)
  map.putBoolean("archived", isArchived)

  return map

}

internal fun InboxAction.toWritableMap(): WritableMap {

  val map = Arguments.createMap()
  map.putString("content", content)
  map.putString("href", href)
  map.putMap("data", data.toWritableMap())

  return map

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
