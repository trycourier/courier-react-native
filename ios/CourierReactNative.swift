import Courier_iOS

@objc(CourierReactNative)
class CourierReactNative: RCTEventEmitter {

  private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
  internal static let COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked"
  internal static let COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT = "pushNotificationDelivered"

  private var lastClickedMessage: [AnyHashable: Any]? = nil

  override init() {
    super.init()
    Courier.agent = CourierAgent.react_native_ios
    let nc = NotificationCenter.default
    nc.addObserver(self, selector: #selector(pushNotificationClicked), name: Notification.Name(rawValue: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT), object: nil)
    nc.addObserver(self, selector: #selector(pushNotificationDelivered), name: Notification.Name(rawValue: CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT), object: nil)

  }

  private func formatandSendData(data: [AnyHashable: Any]?, eventName: String) {
    if let aps = (data?["aps"])! as? [AnyHashable: Any] {
      if let alert = aps["alert"] {
        print("alert value", alert)
        sendEvent(withName: eventName, body: alert)
      }
    }
  }

  @objc private func pushNotificationClicked(notification: Notification) {
    lastClickedMessage = notification.userInfo
    formatandSendData(data: lastClickedMessage, eventName: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT)
  }

  @objc private func pushNotificationDelivered(notification: Notification) {
    formatandSendData(data: notification.userInfo, eventName: CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT)
  }




  @objc(signIn: accessToken: withResolver: withRejecter:)
  func signIn(userId: NSString, accessToken: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.shared.signIn(accessToken: accessToken as String, userId: userId as String, onSuccess: {
      let successMessage = "**************** Credentials are set **************"
      resolve(successMessage)
    }, onFailure: { error in
        reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
      })
  }


  @objc(getNotificationPermissionStatus: withRejecter:)
  func getNotificationPermissionStatus(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.getNotificationPermissionStatus { status in
      resolve(status.name)
    }
  }

  @objc(requestNotificationPermission: withRejecter:)
  func requestNotificationPermission(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.requestNotificationPermission { status in
      resolve(status.name)
    }
  }




  @objc(signOut: withRejecter:)
  func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.shared.signOut(onSuccess: {
      resolve("Signout successful")
    }, onFailure: { error in
        reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
      })
  }

  @objc(getUserId: withRejecter:)
  func getUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    resolve(Courier.shared.userId)
  }

  @objc(getFcmToken: withRejecter:)
  func getFcmToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    resolve(Courier.shared.fcmToken)
  }

  @objc(getApnsToken: withRejecter:)
  func getApnsToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    resolve(Courier.shared.apnsToken)
  }

  @objc(sendPush: withUserId: withTitle: withBody: withProviders: withResolver: withRejecter:)
  func sendPush(authKey: NSString, userId: NSString, title: NSString, body: NSString, providers: NSArray, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let courierProviders = providers as? [String] else {
        reject("No provider supported", CourierReactNative.COURIER_ERROR_TAG, nil)
      return
    }
   
    Courier.shared.sendPush(
      authKey: authKey as String,
      userId: userId as String,
      title: title as String,
      message: body as String,
      isProduction: false,
      providers: courierProviders,
      onSuccess: { requestId in
        resolve(requestId)
      },
      onFailure: { error in
        reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
      })
  }

  @objc func registerPushNotificationClickedOnKilledState() {
    if let clickedMessageData = lastClickedMessage {
      formatandSendData(data: clickedMessageData, eventName: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT)
    }

  }
  
  private var foregroundPresentationOptions: UNNotificationPresentationOptions = []
  
  @objc(iOSForegroundPresentationOptions:)
  func iOSForegroundPresentationOptions(params:NSDictionary){
        if let options = params["options"] as? [String] {
        foregroundPresentationOptions = []
        options.forEach { option in
            switch option {
            case "sound": foregroundPresentationOptions.insert(.sound)
            case "badge": foregroundPresentationOptions.insert(.badge)
            case "list": if #available(iOS 14.0, *) { foregroundPresentationOptions.insert(.list) } else { foregroundPresentationOptions.insert(.alert) }
            case "banner": if #available(iOS 14.0, *) { foregroundPresentationOptions.insert(.banner) } else { foregroundPresentationOptions.insert(.alert) }
            default: break
            }
        }
    }
  }

  override func supportedEvents() -> [String]! {
    return [CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT, CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT]
  }
}


extension UNAuthorizationStatus {

  var name: String {
    switch (self) {
    case .notDetermined: return "notDetermined"
    case .denied: return "denied"
    case .authorized: return "authorized"
    case .provisional: return "provisional"
    case .ephemeral: return "ephemeral"
    @unknown default: return "unknown"
    }
  }

}
