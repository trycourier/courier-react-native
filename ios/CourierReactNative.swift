import Courier_iOS

@objc(CourierReactNative)
class CourierReactNative: RCTEventEmitter {

  private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
  internal static let CORE_CHANNEL = "courier_flutter_core"
  internal static let EVENTS_CHANNEL = "courier_flutter_events"
    
    private var lastClickedMessage: [AnyHashable : Any]? = nil
    
    override init() {
        super.init()
        Courier.agent = CourierAgent.react_native_ios
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(receiveTestNotification), name: Notification.Name(rawValue: "TestNotification"), object: nil)
    }
  
  
  @objc private func receiveTestNotification(notification: Notification) {
      
//      Courier.requestNotificationPermission { status in
//
//      }
      
      lastClickedMessage = notification.userInfo
      
      let number = lastClickedMessage?["the_number"]
      
      print("\(number)")
    
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
  
  override func supportedEvents() -> [String]! {
    return ["testEvent"]
  }

}
