package com.courierreactnative

import android.content.Intent
import com.courier.android.Courier
import com.courier.android.models.CourierAgent
import com.courier.android.models.CourierAuthenticationListener
import com.courier.android.models.CourierInboxListener
import com.courier.android.models.CourierPreferenceChannel
import com.courier.android.models.InboxMessage
import com.courier.android.models.remove
import com.courier.android.modules.addAuthenticationListener
import com.courier.android.modules.addInboxListener
import com.courier.android.modules.clickMessage
import com.courier.android.modules.getToken
import com.courier.android.modules.inboxPaginationLimit
import com.courier.android.modules.isPushPermissionGranted
import com.courier.android.modules.readAllInboxMessages
import com.courier.android.modules.readMessage
import com.courier.android.modules.refreshInbox
import com.courier.android.modules.requestNotificationPermission
import com.courier.android.modules.setToken
import com.courier.android.modules.signIn
import com.courier.android.modules.signOut
import com.courier.android.modules.tenantId
import com.courier.android.modules.unreadMessage
import com.courier.android.modules.userId
import com.courier.android.utils.pushNotification
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.util.UUID


class CourierReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "CourierReactNativeModule"
  private val reactActivity: ReactActivity? get() = currentActivity as? ReactActivity

  // Listeners
  private var authListeners = mutableMapOf<String, CourierAuthenticationListener>()
  private var inboxListeners = mutableMapOf<String, CourierInboxListener>()

  init {

    // User Agent is used to ensure we know the SDK
    // the requests come from
    Courier.USER_AGENT = CourierAgent.REACT_NATIVE_ANDROID

    // Attach the log listener
//    Courier.shared.logListener = { data ->
//      reactContext.sendEvent(CourierEvents.Log.DEBUG_LOG, data)
//    }

  }

  @ReactMethod
  fun addListener(type: String?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  fun removeListeners(type: Int?) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setDebugMode(isDebugging: Boolean): Boolean {
//    Courier.shared.isDebugging = isDebugging
//    return Courier.shared.isDebugging
    return false
  }

  @ReactMethod
  fun registerPushNotificationClickedOnKilledState() {
    reactActivity?.let { activity ->
      checkIntentForPushNotificationClick(activity.intent)
    }
  }

  private fun checkIntentForPushNotificationClick(intent: Intent?) {
    intent?.trackPushNotificationClick { message ->
      postPushNotificationClicked(message)
    }
  }

  private fun postPushNotificationClicked(message: RemoteMessage) {
    reactApplicationContext.sendEvent(
      eventName = CourierEvents.Push.CLICKED_EVENT,
      value = JSONObject(message.pushNotification).toString()
    )
  }

  @ReactMethod
  fun requestNotificationPermission(promise: Promise) {

    reactActivity?.let { activity ->
      Courier.shared.requestNotificationPermission(activity)
    }

    promise.resolve("unknown")

  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {

    reactActivity?.let { context ->

      val isGranted = Courier.shared.isPushPermissionGranted(context)
      val status = if (isGranted) "authorized" else "denied"
      promise.resolve(status)
      return

    }

    promise.resolve("unknown")

  }

  @ReactMethod
  fun signIn(accessToken: String, clientKey: String?, userId: String, tenantId: String?, promise: Promise) {
    Courier.shared.signIn(
      accessToken = accessToken,
      clientKey = clientKey,
      userId = userId,
      tenantId = tenantId,
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun signOut(promise: Promise) {
    Courier.shared.signOut(
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getUserId(): String? {
    return Courier.shared.userId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getTenantId(): String? {
    return Courier.shared.tenantId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun addAuthenticationListener(authId: String): String {

    // Create the listener
    val listener = Courier.shared.addAuthenticationListener { userId ->

      reactApplicationContext.sendEvent(
        eventName = authId,
        value = userId
      )

    }

    // Add the listener to the map
    val id = UUID.randomUUID().toString()
    authListeners[id] = listener

    return id

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeAuthenticationListener(listenerId: String): String {

    // Get the listener
    val listener = authListeners[listenerId]

    // Remove the listener
    listener?.remove()

    // Remove the listener
    authListeners.remove(listenerId)

    return listenerId

  }

  @ReactMethod
  fun getToken(key: String, promise: Promise) {
    val token = Courier.shared.getToken(key)
    promise.resolve(token)
  }

  @ReactMethod
  fun setToken(key: String, token: String, promise: Promise) {
    Courier.shared.setToken(
      provider = key,
      token = token,
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun clickMessage(messageId: String): String {
    Courier.shared.clickMessage(messageId, onFailure = null)
    return messageId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun readMessage(messageId: String): String {
    Courier.shared.readMessage(messageId, onFailure = null)
    return messageId
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun unreadMessage(messageId: String): String {
    Courier.shared.unreadMessage(messageId, onFailure = null)
    return messageId
  }

  @ReactMethod
  fun readAllInboxMessages(promise: Promise) {
    Courier.shared.readAllInboxMessages(
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
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
        json.putArray("messages", messages.toList().toWritableArray())
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

    // Get the listener
    val listener = inboxListeners[listenerId]

    // Remove the listener
    listener?.remove()

    // Remove the listener
    inboxListeners.remove(listenerId)

    return listenerId

  }

  @ReactMethod
  fun refreshInbox(promise: Promise) {
    Courier.shared.refreshInbox {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun fetchNextPageOfMessages(promise: Promise) {
//    Courier.shared.fetchNextPageOfMessages(
//      onSuccess = { messages ->
//        promise.resolve(messages.toWritableArray())
//      },
//      onFailure = { e ->
//        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
//      }
//    )
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setInboxPaginationLimit(limit: Double): String {
    Courier.shared.inboxPaginationLimit = limit.toInt()
    return Courier.shared.inboxPaginationLimit.toString()
  }

  @ReactMethod
  fun getUserPreferences(paginationCursor: String, promise: Promise) {

    val cursor = if (paginationCursor != "") paginationCursor else null

//    Courier.shared.getUserPreferences(
//      paginationCursor = cursor,
//      onSuccess = { preferences ->
//        promise.resolve(preferences.toWritableMap())
//      },
//      onFailure = { e ->
//        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
//      }
//    )

  }

  @ReactMethod
  fun getUserPreferencesTopic(topicId: String, promise: Promise) {
//    Courier.shared.getUserPreferenceTopic(
//      topicId = topicId,
//      onSuccess = { topic ->
//        promise.resolve(topic.toWritableMap())
//      },
//      onFailure = { e ->
//        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
//      }
//    )
  }

  @ReactMethod
  fun putUserPreferencesTopic(topicId: String, status: String, hasCustomRouting: Boolean, customRouting: ReadableArray, promise: Promise) {

    val routing = customRouting.toArrayList().map { CourierPreferenceChannel.fromString(it as String) }

//    Courier.shared.putUserPreferenceTopic(
//      topicId = topicId,
//      status = CourierPreferenceStatus.fromString(status),
//      hasCustomRouting = hasCustomRouting,
//      customRouting = routing,
//      onSuccess = {
//        promise.resolve(null)
//      },
//      onFailure = { e ->
//        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
//      }
//    )

  }

}
