import Courier_iOS

@objc(CourierReactNativeModule)
class CourierReactNativeModule: RCTEventEmitter {

    private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
    internal static let COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked"
    internal static let COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT = "pushNotificationDelivered"
    private static let COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT = "courierDebugEvent"
    
    private var hasListeners = false
    
    private var lastClickedMessage: [AnyHashable: Any]? = nil
    private var notificationCenter: NotificationCenter {
        get {
            return NotificationCenter.default
        }
    }

    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.react_native_ios
        
        // Attach the listeners
        attachObservers()
                
    }
    
    override func startObserving() {

        hasListeners = true

        // setup listeners
        Courier.shared.logListener = { log in
            self.sendEvent(withName: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT, body: log)
        }

    }

    override func stopObserving() {

        hasListeners = false
        // perform actions after listener is removed
        
    }
    
    private func attachObservers() {
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationClicked),
            name: Notification.Name(rawValue: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT),
            object: nil
        )
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationDelivered),
            name: Notification.Name(rawValue: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT),
            object: nil
        )
        
    }
    
    private func sendMessage(name: String, message: [AnyHashable: Any]?) {
        
        guard let message = message else {
            return
        }
     
        do {
            sendEvent(
                withName: name,
                body: try message.toString()
            )
        } catch {
            Courier.log(String(describing: error))
        }
        
    }

    @objc private func pushNotificationClicked(notification: Notification) {
        
        lastClickedMessage = notification.userInfo
        sendMessage(
            name: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        sendMessage(
            name: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT,
            message: notification.userInfo
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        
        sendMessage(
            name: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            message: lastClickedMessage
        )
        
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

    @objc(signIn: withClientKey: withUserId: withResolver: withRejecter:)
    func signIn(accessToken: NSString, clientKey: NSString?, userId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
        Courier.shared.signIn(
           accessToken: accessToken as String,
           clientKey: clientKey as? String,
           userId: userId as String,
           onSuccess: {
               resolve(nil)
           },
           onFailure: { error in
               reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
           }
        )
      
    }

    @objc(signOut: withRejecter:)
    func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.signOut(
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }

    @objc(getUserId: withRejecter:)
    func getUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let userId = Courier.shared.userId
        resolve(userId)
        
    }

    @objc(getFcmToken: withRejecter:)
    func getFcmToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let token = Courier.shared.fcmToken
        resolve(token)
        
    }

    @objc(setFcmToken: withResolver: withRejecter:)
    func setFcmToken(token: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Courier.shared.setFCMToken(
            token as String,
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
    
    }

    @objc(getApnsToken: withRejecter:)
    func getApnsToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let token = Courier.shared.apnsToken
        resolve(token)
        
    }

    @objc(sendPush: withUserId: withTitle: withBody: withProviders: withResolver: withRejecter:)
    func sendPush(authKey: NSString, userId: NSString, title: NSString, body: NSString, providers: NSArray, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let courierProviders = providers as? [String] else {
            reject("No provider supported", CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            return
        }

//        Courier.shared.sendPush(
//            authKey: authKey as String,
//            userId: userId as String,
//            title: title as String,
//            message: body as String,
//            providers: courierProviders,
//            onSuccess: { requestId in
//                resolve(requestId)
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }

    @objc(iOSForegroundPresentationOptions:)
    func iOSForegroundPresentationOptions(params: NSDictionary) {
        
        let rawValue = params.toPresentationOptions().rawValue
        NotificationCenter.default.post(
            name: Notification.Name("iosForegroundNotificationPresentationOptions"),
            object: nil,
            userInfo: ["options": rawValue]
        )
        
    }
    
    @objc(setDebugMode: withResolver: withRejecter:)
    func setDebugMode(isDebugging: Bool,resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        Courier.shared.isDebugging = isDebugging
        resolve(Courier.shared.isDebugging)
        
    }

    override func supportedEvents() -> [String]! {
        return [
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT,
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT
        ]
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}

extension [AnyHashable: Any] {
    
    func toString() throws -> String {
        let json = try JSONSerialization.data(withJSONObject: self)
        let str = String(data: json, encoding: .utf8)
        return str ?? "Invalid JSON"
    }
    
}

extension NSDictionary {
    
    func toPresentationOptions() -> UNNotificationPresentationOptions {
        
        var foregroundPresentationOptions: UNNotificationPresentationOptions = []

        if let options = self["options"] as? [String] {
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

        return foregroundPresentationOptions
        
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
