package com.courierreactnative

import com.courier.android.client.CourierClient
import com.courier.android.models.CourierDevice
import com.courier.android.models.CourierPreferenceChannel
import com.courier.android.models.CourierPreferenceStatus
import com.courier.android.models.CourierTrackingEvent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID

class CourierClientModule(reactContext: ReactApplicationContext): ReactNativeModule(tag = "Client Error", name = "CourierClientModule", reactContext = reactContext) {

  private var clients: MutableMap<String, CourierClient> = mutableMapOf()

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun addClient(options: ReadableMap): String {

    val userId = options.getString("userId")
    val showLogs = if (options.hasKey("showLogs")) options.getBoolean("showLogs") else null

    if (userId == null || showLogs == null) {
      return "invalid"
    }

    val client = CourierClient(
      jwt = options.getString("jwt"),
      clientKey = options.getString("clientKey"),
      userId = userId,
      connectionId = options.getString("connectionId"),
      tenantId = options.getString("tenantId"),
      showLogs = showLogs
    )

    val uuid = UUID.randomUUID().toString()
    clients[uuid] = client

    return uuid

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeClient(clientId: String): String {
    clients.remove(clientId)
    return clientId
  }

  // Tokens

  @ReactMethod
  fun putUserToken(clientId: String, token: String, provider: String, device: ReadableMap?, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    if (reactActivity == null) {
      promise.rejectMissingContext()
      return@launch
    }

    val courierDevice = device?.let {
      return@let CourierDevice(
        appId = it.getString("appId"),
        adId = it.getString("adId"),
        deviceId = it.getString("deviceId"),
        platform = it.getString("platform"),
        manufacturer = it.getString("manufacturer"),
        model = it.getString("model")
      )
    }

    try {
      client.tokens.putUserToken(
        token = token,
        provider = provider,
        device = courierDevice ?: CourierDevice.current(reactActivity!!)
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun deleteUserToken(clientId: String, token: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.tokens.deleteUserToken(
        token = token,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  // Brands

  @ReactMethod
  fun getBrand(clientId: String, brandId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val brand = client.brands.getBrand(
        brandId = brandId
      )
      val json = brand.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  // Inbox

  @ReactMethod
  fun getMessages(clientId: String, paginationLimit: Int?, startCursor: String?, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val res = client.inbox.getMessages(
        paginationLimit = paginationLimit ?: 24,
        startCursor = startCursor,
      )
      val json = res.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun getArchivedMessages(clientId: String, paginationLimit: Int?, startCursor: String?, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val res = client.inbox.getArchivedMessages(
        paginationLimit = paginationLimit ?: 24,
        startCursor = startCursor,
      )
      val json = res.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun getMessageById(clientId: String, messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val res = client.inbox.getMessage(
        messageId = messageId,
      )
      val json = res.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun getUnreadMessageCount(clientId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val count = client.inbox.getUnreadMessageCount()
      promise.resolve(count)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun openMessage(clientId: String, messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.open(
        messageId = messageId,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun readMessage(clientId: String, messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.read(
        messageId = messageId,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun unreadMessage(clientId: String, messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.unread(
        messageId = messageId,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun clickMessage(clientId: String, messageId: String, trackingId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.click(
        messageId = messageId,
        trackingId = trackingId,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun archiveMessage(clientId: String, messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.archive(
        messageId = messageId,
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun readAllMessages(clientId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.inbox.readAll()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  // Preferences

  @ReactMethod
  fun getUserPreferences(clientId: String, paginationCursor: String?, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val res = client.preferences.getUserPreferences(
        paginationCursor = paginationCursor
      )
      val json = res.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun getUserPreferenceTopic(clientId: String, topicId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      val res = client.preferences.getUserPreferenceTopic(
        topicId = topicId
      )
      val json = res.toJson()
      promise.resolve(json)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  @ReactMethod
  fun putUserPreferenceTopic(clientId: String, topicId: String, status: String, hasCustomRouting: Boolean, customRouting: ReadableArray, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.preferences.putUserPreferenceTopic(
        topicId = topicId,
        status = CourierPreferenceStatus.fromString(status),
        hasCustomRouting = hasCustomRouting,
        customRouting = customRouting.toArrayList().map { CourierPreferenceChannel.fromString(it as String) },
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  // Tracking

  @ReactMethod
  fun postTrackingUrl(clientId: String, url: String, event: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {

    val client = clients[clientId]
    if (client == null) {
      promise.rejectMissingClient()
      return@launch
    }

    try {
      client.tracking.postTrackingUrl(
        url = url,
        event = CourierTrackingEvent.valueOf(event),
      )
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }

  }

  private fun Promise.rejectMissingContext() {
    reject("Missing Context", tag, null)
  }

  private fun Promise.rejectMissingClient() {
    reject("Missing Client", tag, null)
  }

  private fun Promise.apiError(throwable: Throwable) {
    reject(throwable.message, tag, throwable)
  }

}
