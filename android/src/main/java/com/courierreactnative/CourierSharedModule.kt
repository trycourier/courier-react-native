package com.courierreactnative

import com.courier.android.Courier
import com.courier.android.models.CourierAuthenticationListener
import com.courier.android.models.CourierInboxListener
import com.courier.android.models.InboxMessageSet
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
import com.courier.android.ui.inbox.InboxMessageFeed
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CourierSharedModule(
  reactContext: ReactApplicationContext
) : ReactNativeModule(
  tag = "Shared Instance Error",
  name = "CourierSharedModule",
  reactContext = reactContext
) {

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

  @ReactMethod
  fun attachEmitter(emitterId: String, promise: Promise) {
    promise.resolve(emitterId)
  }

  // Client

  @ReactMethod
  fun getClient(promise: Promise) {
    val options = Courier.shared.client?.options
    promise.resolve(options?.toJson())
  }

  // Authentication

  @ReactMethod
  fun getUserId(promise: Promise) {
    promise.resolve(Courier.shared.userId)
  }

  @ReactMethod
  fun getTenantId(promise: Promise) {
    promise.resolve(Courier.shared.tenantId)
  }

  @ReactMethod
  fun getIsUserSignedIn(promise: Promise) {
    promise.resolve(Courier.shared.isUserSignedIn.toString())
  }

  @ReactMethod
  fun signIn(
    accessToken: String,
    clientKey: String?,
    userId: String,
    tenantId: String?,
    showLogs: Boolean,
    promise: Promise
  ) {
    CoroutineScope(Dispatchers.Main).launch {
      Courier.shared.signIn(
        userId = userId,
        tenantId = tenantId,
        accessToken = accessToken,
        clientKey = clientKey,
        showLogs = showLogs
      )
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      Courier.shared.signOut()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun addAuthenticationListener(listenerId: String, promise: Promise) {
    // Create the listener
    val listener = Courier.shared.addAuthenticationListener { userId ->
      reactApplicationContext.sendEvent(
        eventName = listenerId,
        value = userId
      )
    }

    // Add the listener to the map
    authenticationListeners[listenerId] = listener
    promise.resolve(listenerId)
  }

  @ReactMethod
  fun removeAuthenticationListener(listenerId: String, promise: Promise) {
    val listener = authenticationListeners[listenerId]
    listener?.remove()
    authenticationListeners.remove(listenerId)
    promise.resolve(listenerId)
  }

  @ReactMethod
  fun removeAllAuthenticationListeners(promise: Promise) {
    authenticationListeners.values.forEach { it.remove() }
    authenticationListeners.clear()
    promise.resolve(null)
  }

  // Push

  @ReactMethod
  fun getAllTokens(promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      val tokens = Courier.shared.tokens
      val resultMap = Arguments.createMap()
      tokens.forEach { (key, value) ->
        resultMap.putString(key, value)
      }
      promise.resolve(resultMap)
    }
  }

  @ReactMethod
  fun getToken(provider: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      val token = Courier.shared.getToken(provider)
      promise.resolve(token)
    }
  }

  @ReactMethod
  fun setToken(provider: String, token: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.setToken(provider, token)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  // Inbox

  @ReactMethod
  fun getInboxPaginationLimit(promise: Promise) {
    promise.resolve(Courier.shared.inboxPaginationLimit.toString())
  }

  @ReactMethod
  fun setInboxPaginationLimit(limit: Double, promise: Promise) {
    Courier.shared.inboxPaginationLimit = limit.toInt()
    promise.resolve(Courier.shared.inboxPaginationLimit.toString())
  }

  @ReactMethod
  fun openMessage(messageId: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.openMessage(messageId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun archiveMessage(messageId: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.archiveMessage(messageId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun clickMessage(messageId: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.clickMessage(messageId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun readMessage(messageId: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.readMessage(messageId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun unreadMessage(messageId: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.unreadMessage(messageId)
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun readAllInboxMessages(promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        Courier.shared.readAllInboxMessages()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }

  @ReactMethod
  fun addInboxListener(
    listenerId: String,
    loadingId: String,
    errorId: String,
    unreadCountId: String,
    totalCountId: String,
    messagesChangedId: String,
    pageAddedId: String,
    messageEventId: String,
    promise: Promise
  ) {
    CoroutineScope(Dispatchers.Main).launch {
      val listener = Courier.shared.addInboxListener(
        onLoading = { isRefresh ->
          reactApplicationContext.sendEvent(
            eventName = loadingId,
            value = isRefresh
          )
        },
        onError = { e ->
          reactApplicationContext.sendEvent(
            eventName = errorId,
            value = e.message ?: "Courier Inbox Error"
          )
        },
        onUnreadCountChanged = { unreadCount ->
          reactApplicationContext.sendEvent(
            eventName = unreadCountId,
            value = unreadCount
          )
        },
        onTotalCountChanged = { totalCount, feed ->
          val json = Arguments.createMap().apply {
            putString("feed", if (feed == InboxMessageFeed.FEED) "feed" else "archive")
            putInt("totalCount", totalCount)
          }
          reactApplicationContext.sendEvent(
            eventName = totalCountId,
            value = json
          )
        },
        onMessagesChanged = { messages, canPaginate, feed ->
          val json = Arguments.createMap().apply {
            putString("feed", if (feed == InboxMessageFeed.FEED) "feed" else "archive")
            putArray("messages", messages.map { it.toJson() }.toWritableArray())
            putBoolean("canPaginate", canPaginate)
          }
          reactApplicationContext.sendEvent(
            eventName = messagesChangedId,
            value = json
          )
        },
        onPageAdded = { messages, canPaginate, isFirstPage, feed ->
          val json = Arguments.createMap().apply {
            putString("feed", if (feed == InboxMessageFeed.FEED) "feed" else "archive")
            putArray("messages", messages.map { it.toJson() }.toWritableArray())
            putBoolean("canPaginate", canPaginate)
            putBoolean("isFirstPage", isFirstPage)
          }
          reactApplicationContext.sendEvent(
            eventName = pageAddedId,
            value = json
          )
        },
        onMessageEvent = { message, index, feed, event ->
          val json = Arguments.createMap().apply {
            putString("feed", if (feed == InboxMessageFeed.FEED) "feed" else "archive")
            putInt("index", index)
            putString("event", event.value)
            putString("message", message.toJson())
          }
          reactApplicationContext.sendEvent(
            eventName = messageEventId,
            value = json
          )
        }
      )

      inboxListeners[listenerId] = listener
      promise.resolve(listenerId)
    }
  }

  private fun InboxMessageSet.toJson(): WritableMap? {
    val json = Arguments.createMap()
    json.putArray("messages", messages.toList().map { it.toJson() }.toWritableArray())
    json.putInt("totalMessageCount", totalCount)
    json.putBoolean("canPaginate", canPaginate)
    return json
  }

  @ReactMethod
  fun removeInboxListener(listenerId: String, promise: Promise) {
    val listener = inboxListeners[listenerId]
    listener?.remove()
    inboxListeners.remove(listenerId)
    promise.resolve(listenerId)
  }

  @ReactMethod
  fun removeAllInboxListeners(promise: Promise) {
    inboxListeners.values.forEach { it.remove() }
    inboxListeners.clear()
    promise.resolve(null)
  }

  @ReactMethod
  fun refreshInbox(promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      Courier.shared.refreshInbox()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun fetchNextPageOfMessages(inboxMessageFeed: String, promise: Promise) {
    CoroutineScope(Dispatchers.Main).launch {
      try {
        val messageSet = Courier.shared.fetchNextInboxPage(
          if (inboxMessageFeed == "archived") InboxMessageFeed.ARCHIVE else InboxMessageFeed.FEED
        )
        promise.resolve(messageSet?.toJson())
      } catch (e: Exception) {
        promise.apiError(e)
      }
    }
  }
}
