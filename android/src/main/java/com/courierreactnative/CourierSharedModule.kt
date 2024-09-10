package com.courierreactnative

import com.courier.android.Courier
import com.courier.android.models.CourierAuthenticationListener
import com.courier.android.models.CourierInboxListener
import com.courier.android.models.InboxMessage
import com.courier.android.models.remove
import com.courier.android.modules.addAuthenticationListener
import com.courier.android.modules.addInboxListener
import com.courier.android.modules.archiveMessage
import com.courier.android.modules.clickMessage
import com.courier.android.modules.fetchNextInboxPage
import com.courier.android.modules.getToken
import com.courier.android.modules.inboxPaginationLimit
import com.courier.android.modules.isUserSignedIn
import com.courier.android.modules.openMessage
import com.courier.android.modules.readAllInboxMessages
import com.courier.android.modules.readMessage
import com.courier.android.modules.refreshInbox
import com.courier.android.modules.setToken
import com.courier.android.modules.signIn
import com.courier.android.modules.signOut
import com.courier.android.modules.tenantId
import com.courier.android.modules.tokens
import com.courier.android.modules.unreadMessage
import com.courier.android.modules.userId
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID


class CourierSharedModule(reactContext: ReactApplicationContext): ReactNativeModule(tag = "Shared Instance Error", name = "CourierSharedModule", reactContext = reactContext) {

  // Listeners
  private var authenticationListeners = mutableMapOf<String, CourierAuthenticationListener>()
  private var inboxListeners = mutableMapOf<String, CourierInboxListener>()

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  // Client

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getClient(): String? {
    val options = Courier.shared.client?.options ?: return null
    return options.toJson()
  }

  // Authentication

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getUserId(): String? {
    return Courier.shared.userId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getTenantId(): String? {
    return Courier.shared.tenantId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getIsUserSignedIn(): String {
    return Courier.shared.isUserSignedIn.toString()
  }

  @ReactMethod
  fun signIn(accessToken: String, clientKey: String?, userId: String, tenantId: String?, showLogs: Boolean, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    Courier.shared.signIn(
      userId = userId,
      tenantId = tenantId,
      accessToken = accessToken,
      clientKey = clientKey,
      showLogs = showLogs
    )
    promise.resolve(null)
  }

  @ReactMethod
  fun signOut(promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    Courier.shared.signOut()
    promise.resolve(null)
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun addAuthenticationListener(listenerId: String): String {

    // Create the listener
    val listener = Courier.shared.addAuthenticationListener { userId ->
      reactApplicationContext.sendEvent(
        eventName = listenerId,
        value = userId
      )
    }

    // Add the listener to the map
    authenticationListeners[listenerId] = listener

    return listenerId

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeAuthenticationListener(listenerId: String): String {

    val listener = authenticationListeners[listenerId]

    // Disable the listener
    listener?.remove()

    // Remove the id from the map
    authenticationListeners.remove(listenerId)

    return listenerId

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeAllAuthenticationListeners(): String? {
    authenticationListeners.values.forEach { it.remove() }
    authenticationListeners.clear()
    return null
  }

  // Push

  @ReactMethod
  fun getAllTokens(promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    val tokens = Courier.shared.tokens
    val resultMap = Arguments.createMap()
    tokens.forEach { (key, value) ->
      resultMap.putString(key, value)
    }
    promise.resolve(resultMap)
  }

  @ReactMethod
  fun getToken(provider: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    val token = Courier.shared.getToken(provider)
    promise.resolve(token)
  }

  @ReactMethod
  fun setToken(provider: String, token: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.setToken(provider, token)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  // Inbox

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getInboxPaginationLimit(): String {
    return Courier.shared.inboxPaginationLimit.toString()
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setInboxPaginationLimit(limit: Double): String {
    Courier.shared.inboxPaginationLimit = limit.toInt()
    return Courier.shared.inboxPaginationLimit.toString()
  }

  @ReactMethod
  fun openMessage(messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.openMessage(messageId)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod
  fun archiveMessage(messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.archiveMessage(messageId)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod
  fun clickMessage(messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.clickMessage(messageId)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod
  fun readMessage(messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.readMessage(messageId)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod
  fun unreadMessage(messageId: String, promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.unreadMessage(messageId)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod
  fun readAllInboxMessages(promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      Courier.shared.readAllInboxMessages()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun addInboxListener(loadingId: String, errorId: String, messagesId: String): String {

    val listener = Courier.shared.addInboxListener(
      onInitialLoad = {

        reactApplicationContext.sendEvent(
          eventName = loadingId,
          value = null
        )

      },
      onError = { e ->

        reactApplicationContext.sendEvent(
          eventName = errorId,
          value = e.message ?: "Courier Inbox Error"
        )

      },
      onMessagesChanged = { messages: List<InboxMessage>, unreadMessageCount: Int, totalMessageCount: Int, canPaginate: Boolean ->

        val json = Arguments.createMap()
        json.putArray("messages", messages.toList().map { it.toJson() }.toWritableArray())
        json.putInt("unreadMessageCount", unreadMessageCount)
        json.putInt("totalMessageCount", totalMessageCount)
        json.putBoolean("canPaginate", canPaginate)

        reactApplicationContext.sendEvent(
          eventName = messagesId,
          value = json
        )

      }
    )

    // Add listener
    val id = UUID.randomUUID().toString()
    inboxListeners[id] = listener

    return id

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeInboxListener(listenerId: String): String {
    val listener = inboxListeners[listenerId]
    listener?.remove()
    inboxListeners.remove(listenerId)
    return listenerId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeAllInboxListeners(): String? {
    inboxListeners.values.forEach { it.remove() }
    inboxListeners.clear()
    return null
  }

  @ReactMethod
  fun refreshInbox(promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    Courier.shared.refreshInbox()
    promise.resolve(null)
  }

  @ReactMethod
  fun fetchNextPageOfMessages(promise: Promise) = CoroutineScope(Dispatchers.Main).launch {
    try {
      val messages = Courier.shared.fetchNextInboxPage()
      promise.resolve(messages.map { it.toJson() }.toWritableArray())
    } catch (e: Exception) {
      promise.apiError(e)
    }
  }

}
