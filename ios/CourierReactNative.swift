import Courier_iOS

@objc(CourierReactNative)
class CourierReactNative: RCTEventEmitter {

    private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
    internal static let COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked"
    internal static let COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT = "pushNotificationDelivered"
    private static let COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT = "courierDebugEvent"
    
    private var isDebugListenerRegistered = false
    
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
    
    private func attachObservers() {
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationClicked),
            name: Notification.Name(rawValue: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT),
            object: nil
        )
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationDelivered),
            name: Notification.Name(rawValue: CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT),
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
            name: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        sendMessage(
            name: CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT,
            message: notification.userInfo
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        
        sendMessage(
            name: CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc(signIn: accessToken: withResolver: withRejecter:)
    func signIn(userId: NSString, accessToken: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
        Courier.shared.signIn(
            accessToken: accessToken as String,
            userId: userId as String,
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
            }
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

    @objc(signOut: withRejecter:)
    func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.signOut(
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
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
                reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
            }
        )
    
    }

    @objc(getApnsToken: withRejecter:)
    func getApnsToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let token = Courier.shared.apnsToken
        resolve(token)
        
    }

    @objc(sendPush: withUserId: withTitle: withBody: withProviders: withIsProduction: withResolver: withRejecter:)
    func sendPush(authKey: NSString, userId: NSString, title: NSString, body: NSString, providers: NSArray, isProduction: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let courierProviders = providers as? [String] else {
            reject("No provider supported", CourierReactNative.COURIER_ERROR_TAG, nil)
            return
        }

        Courier.shared.sendPush(
            authKey: authKey as String,
            userId: userId as String,
            title: title as String,
            message: body as String,
            isProduction: isProduction,
            providers: courierProviders,
            onSuccess: { requestId in
                resolve(requestId)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
            }
        )
        
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
        
        // Send notification to react native side
        if (isDebugging && !isDebugListenerRegistered) {
            isDebugListenerRegistered = true
            Courier.shared.logListener = { log in
                self.sendEvent(withName: CourierReactNative.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT, body: log)
            }
        }
        
        Courier.shared.isDebugging = isDebugging
        resolve(Courier.shared.isDebugging)
        
    }

    override func supportedEvents() -> [String]! {
        return [
            CourierReactNative.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            CourierReactNative.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT,
            CourierReactNative.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT
        ]
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
