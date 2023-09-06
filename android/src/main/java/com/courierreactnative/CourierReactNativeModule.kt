package com.courierreactnative

import android.content.Intent
import com.courier.android.Courier
import com.courier.android.models.*
import com.courier.android.modules.*
import com.courier.android.utils.pushNotification
import com.courier.android.utils.trackPushNotificationClick
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.*
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.util.*


class CourierReactNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "CourierReactNativeModule"
  private val reactActivity: ReactActivity? get() = currentActivity as? ReactActivity

  private val authListeners = mutableMapOf<String, CourierAuthenticationListener>()
  private val inboxListeners = mutableMapOf<String, CourierInboxListener>()

  init {

    // User Agent is used to ensure we know the SDK
    // the requests come from
    Courier.USER_AGENT = CourierAgent.REACT_NATIVE_ANDROID

    // Attach the log listener
    Courier.shared.logListener = { data ->
      reactContext.sendEvent(CourierEvents.Log.DEBUG_LOG, data)
    }

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setDebugMode(isDebugging: Boolean): Boolean {
    Courier.shared.isDebugging = isDebugging
    return Courier.shared.isDebugging
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
//    try {
//      reactActivity?.requestNotificationPermission { isGranted ->
////        val status = if (isGranted) NotificationPermissionStatus.AUTHORIZED else NotificationPermissionStatus.DENIED
////        promise.resolve(status.value)
//      }
//    } catch (e: Exception) {
//      promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
//    }
  }

  @ReactMethod
  fun getNotificationPermissionStatus(promise: Promise) {
//    try {
//      reactActivity?.getNotificationPermissionStatus { isGranted ->
//        val status = if (isGranted) NotificationPermissionStatus.AUTHORIZED else NotificationPermissionStatus.DENIED
//        promise.resolve(status.value)
//      }
//    } catch (e: Exception) {
//      promise.reject(COURIER_ERROR_TAG, e)
//    }
  }

  @ReactMethod
  fun signIn(accessToken: String, clientKey: String?, userId: String, promise: Promise) {
    Courier.shared.signIn(
      accessToken = accessToken,
      clientKey = clientKey,
      userId = userId,
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
  fun addAuthenticationListener(): String {

    val listener = Courier.shared.addAuthenticationListener { userId ->
      reactApplicationContext.sendEvent(
        eventName = CourierEvents.Auth.USER_CHANGED,
        value = userId
      )
    }

    val id = UUID.randomUUID().toString()
    authListeners[id] = listener

    return id

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeAuthenticationListener(listenerId: String): String {

    // Remove the listener
    val listener = authListeners[listenerId]
    listener?.remove()

    // Remove from map
    authListeners.remove(listenerId)

    return listenerId

  }

  @ReactMethod
  fun setFcmToken(token: String, promise: Promise) {
    Courier.shared.setFCMToken(
      token = token,
      onSuccess = {
        promise.resolve(null)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun getFcmToken(promise: Promise) {
    Courier.shared.getFCMToken(
      onSuccess = { token ->
        promise.resolve(token)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod
  fun readMessage(messageId: String, promise: Promise) {
    // TODO: Read Message exposure
    promise.resolve("TODO")
  }

  @ReactMethod
  fun unreadMessage(messageId: String, promise: Promise) {
    // TODO: Read Message exposure
    promise.resolve("TODO")
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
  fun addInboxListener(): String {

    val listener = Courier.shared.addInboxListener(
      onInitialLoad = {
        reactApplicationContext.sendEvent(
          eventName = CourierEvents.Inbox.INITIAL_LOADING,
          value = null
        )
      },
      onError = { e ->
        reactApplicationContext.sendEvent(
          eventName = CourierEvents.Inbox.ERROR,
          value = e.message ?: "Courier Inbox Error"
        )
      },
      onMessagesChanged = { messages: List<InboxMessage>, unreadMessageCount: Int, totalMessageCount: Int, canPaginate: Boolean ->

        val json = mapOf(
          "messages" to messages.map { it.toWritableMap() },
          "unreadMessageCount" to unreadMessageCount,
          "totalMessageCount" to totalMessageCount,
          "canPaginate" to canPaginate
        )

        reactApplicationContext.sendEvent(
          eventName = CourierEvents.Inbox.MESSAGES_CHANGED,
          value = json.toWritableMap()
        )

      }
    )

    val id = UUID.randomUUID().toString()
    inboxListeners[id] = listener

    return id

  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun removeInboxListener(listenerId: String): String {

    // Remove the listener
    val listener = inboxListeners[listenerId]
    listener?.remove()

    // Remove from map
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
    Courier.shared.fetchNextPageOfMessages(
      onSuccess = { messages ->
        promise.resolve(messages)
      },
      onFailure = { e ->
        promise.reject(CourierEvents.COURIER_ERROR_TAG, e)
      }
    )
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun setInboxPaginationLimit(limit: Double): String {
    Courier.shared.inboxPaginationLimit = limit.toInt()
    return Courier.shared.inboxPaginationLimit.toString()
  }

//
//  @ReactMethod
//  fun sendPush(
//    authKey: String,
//    userId: String,
//    title: String,
//    body: String,
//    providers: ReadableArray,
//    promise: Promise
//  ) {
////    Courier.shared.sendPush(
////      authKey = authKey,
////      userId = userId,
////      title = title,
////      body = body,
////      providers = providers.toCourierProviders(),
////      onSuccess = { messageId ->
////        promise.resolve(messageId)
////      },
////      onFailure = { e ->
////        promise.reject(COURIER_ERROR_TAG, e)
////      }
////    )
//  }
//
//  @ReactMethod
//  fun registerPushNotificationClickedOnKilledState() {
//    reactActivity?.let { activity ->
//      checkIntentForPushNotificationClick(activity.intent)
//    }
//  }
//
//  private fun checkIntentForPushNotificationClick(intent: Intent?) {
//    intent?.trackPushNotificationClick { message ->
//      postPushNotificationClicked(message)
//    }
//  }
//
//  private fun postPushNotificationClicked(message: RemoteMessage) {
//    sendEvent(
//      reactApplicationContext,
//      COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
//      JSONObject(message.pushNotification).toString()
//    )
//  }
//
//
//
//  @ReactMethod
//  fun addListener(eventName: String?) {
//    // Empty
//  }
//
//  @ReactMethod
//  fun removeListeners(count: Int?) {
//    // Empty
//  }
//
//  private fun ReadableArray.toCourierProviders(): List<CourierProvider> {
//    val providers: MutableList<CourierProvider> = mutableListOf()
//    for (provider in toArrayList()) {
//      CourierProvider.values().forEach {
//        if (it.value == provider) {
//          providers.add(it)
//        }
//      }
//    }
//    return providers
//  }

}
