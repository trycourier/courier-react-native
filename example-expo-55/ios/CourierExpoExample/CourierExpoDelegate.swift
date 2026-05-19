import UIKit
import UserNotifications
import Courier_iOS
import React

@objc class CourierExpoDelegate: NSObject, UNUserNotificationCenterDelegate {

  private var notificationPresentationOptions: UNNotificationPresentationOptions = []
  private var cachedMessage: [AnyHashable: Any]?
  private var isReactNativeReady = false

  private let courierForegroundOptionsDidChangeNotification = Notification.Name("iosForegroundNotificationPresentationOptions")

  override init() {
    super.init()

    Courier.agent = CourierAgent.reactNativeExpoIOS("5.8.0")

    UIApplication.shared.registerForRemoteNotifications()

    UNUserNotificationCenter.current().delegate = self

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(notificationPresentationOptionsUpdate(_:)),
      name: courierForegroundOptionsDidChangeNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onBridgeWillReload),
      name: NSNotification.Name.RCTBridgeWillReload,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onReactNativeReady(_:)),
      name: NSNotification.Name.RCTContentDidAppear,
      object: nil
    )
  }

  @objc private func onReactNativeReady(_ note: Notification) {
    isReactNativeReady = true

    if let message = cachedMessage {
      NotificationCenter.default.post(
        name: Notification.Name("pushNotificationClicked"),
        object: nil,
        userInfo: message
      )
      cachedMessage = nil
    }
  }

  @objc private func onBridgeWillReload() {
    isReactNativeReady = false
  }

  @objc private func notificationPresentationOptionsUpdate(_ notification: Notification) {
    if let userInfo = notification.userInfo,
       let options = userInfo["options"] as? NSNumber {
      notificationPresentationOptions = UNNotificationPresentationOptions(rawValue: options.uintValue)
    }
  }

  func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    let content = response.notification.request.content
    let message = content.userInfo

    Task {
      await message.trackMessage(event: .clicked)
    }

    let pushNotification = Courier.formatPushNotification(content: content)

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      if self.isReactNativeReady {
        NotificationCenter.default.post(
          name: Notification.Name("pushNotificationClicked"),
          object: nil,
          userInfo: pushNotification
        )
      } else {
        self.cachedMessage = pushNotification
      }
      completionHandler()
    }
  }

  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    let content = notification.request.content
    let message = content.userInfo

    Task {
      await message.trackMessage(event: .delivered)
    }

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      let pushNotification = Courier.formatPushNotification(content: content)
      NotificationCenter.default.post(
        name: Notification.Name("pushNotificationDelivered"),
        object: nil,
        userInfo: pushNotification
      )
      completionHandler(self.notificationPresentationOptions)
    }
  }

  @objc func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("[Courier] Failed to register for remote notifications: \(error.localizedDescription)")
  }

  @objc func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Task { @CourierActor in
      Courier.setAPNSToken(deviceToken)
    }
  }

  deinit {
    cachedMessage = nil
    isReactNativeReady = false
    NotificationCenter.default.removeObserver(self)
  }
}
