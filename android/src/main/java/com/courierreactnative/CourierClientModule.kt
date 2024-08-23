package com.courierreactnative

import com.courier.android.client.CourierClient
import com.courier.android.models.CourierDevice
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
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
