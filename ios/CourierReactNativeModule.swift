import Courier_iOS

@objc(CourierReactNativeModule)
class CourierReactNativeModule: RCTEventEmitter {

    private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
    internal static let COURIER_PUSH_NOTIFICATION_CLICKED_EVENT = "pushNotificationClicked"
    internal static let COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT = "pushNotificationDelivered"
    private static let COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT = "courierDebugEvent"
    
    class InboxEvents {
        internal static let INITIAL_LOADING = "inboxInitialLoad"
        internal static let ERROR = "inboxError"
        internal static let MESSAGES_CHANGED = "inboxMessagesChanged"
    }
    
    private var inboxListeners = [String: CourierInboxListener]()
    
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
            self.sendEvent(
                withName: CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT,
                body: log
            )
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
    
    @objc(setDebugMode:)
    func setDebugMode(isDebugging: Bool) -> String {
        Courier.shared.isDebugging = isDebugging
        return String(describing: Courier.shared.isDebugging)
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

    @objc func getUserId() -> String? {
        return Courier.shared.userId
    }

    // TODO:
    @objc(getFcmToken: withRejecter:)
    func getFcmToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let token = Courier.shared.fcmToken
        resolve(token)
        
    }

    // TODO:
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

    // TODO:
    @objc(getApnsToken: withRejecter:)
    func getApnsToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let token = Courier.shared.apnsToken
        resolve(token)
        
    }

    @objc(iOSForegroundPresentationOptions:)
    func iOSForegroundPresentationOptions(params: NSDictionary) -> String {
        
        let rawValue = params.toPresentationOptions().rawValue
        NotificationCenter.default.post(
            name: Notification.Name("iosForegroundNotificationPresentationOptions"),
            object: nil,
            userInfo: ["options": rawValue]
        )
        
        return String(describing: rawValue)
        
    }
    
    @objc(readMessage: withResolver: withRejecter:)
    func readMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.readMessage(
            messageId: messageId as String,
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc(unreadMessage: withResolver: withRejecter:)
    func unreadMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.unreadMessage(
            messageId: messageId as String,
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc(readAllInboxMessages: withRejecter:)
    func readAllInboxMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.readAllInboxMessages(
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc func addInboxListener() -> String {
        
        let listener = Courier.shared.addInboxListener(
            onInitialLoad: { [weak self] in
                
                self?.sendEvent(
                    withName: CourierReactNativeModule.InboxEvents.INITIAL_LOADING,
                    body: nil
                )
                
            },
            onError: { [weak self] error in
                
                self?.sendEvent(
                    withName: CourierReactNativeModule.InboxEvents.ERROR,
                    body: String(describing: error)
                )
                
            },
            onMessagesChanged: { [weak self] messages, unreadMessageCount, totalMessageCount, canPaginate in
                
                let json: [String: Any] = [
                    "messages": messages.map { $0.toDictionary() },
                    "unreadMessageCount": unreadMessageCount,
                    "totalMessageCount": totalMessageCount,
                    "canPaginate": canPaginate
                ]
                
                self?.sendEvent(
                    withName: CourierReactNativeModule.InboxEvents.MESSAGES_CHANGED,
                    body: json
                )
                
            }
        )
        
        // Create an id and add the listener to the dictionary
        let id = UUID().uuidString
        inboxListeners[id] = listener
        
        return id
        
    }
    
    @objc(refreshInbox: withRejecter:)
    func refreshInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.refreshInbox {
            resolve(nil)
        }
        
    }
    
    @objc(removeInboxListener:)
    func removeInboxListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        // Remove the listener
        let listener = inboxListeners[id]
        listener?.remove()
        
        // Remove from dictionary
        inboxListeners.removeValue(forKey: id)
        
        return id
        
    }
    
    @objc(fetchNextPageOfMessages: withRejecter:)
    func fetchNextPageOfMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.fetchNextPageOfMessages(
            onSuccess: { messages in
                resolve(messages.map { $0.toDictionary() })
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc(setInboxPaginationLimit:)
    func setInboxPaginationLimit(limit: Double) -> String {
        Courier.shared.inboxPaginationLimit = Int(limit)
        return String(describing: Courier.shared.inboxPaginationLimit)
    }

    override func supportedEvents() -> [String]! {
        return [
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_CLICKED_EVENT,
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DELIVERED_EVENT,
            CourierReactNativeModule.COURIER_PUSH_NOTIFICATION_DEBUG_LOG_EVENT,
            CourierReactNativeModule.InboxEvents.INITIAL_LOADING,
            CourierReactNativeModule.InboxEvents.ERROR,
            CourierReactNativeModule.InboxEvents.MESSAGES_CHANGED
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
