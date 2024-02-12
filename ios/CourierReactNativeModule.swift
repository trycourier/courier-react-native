import Courier_iOS

@objc(CourierReactNativeModule)
class CourierReactNativeModule: RCTEventEmitter {

    private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
    
    class LogEvents {
        internal static let DEBUG_LOG = "courierDebugEvent"
    }
    
    class AuthEvents {
        internal static let USER_CHANGED = "courierAuthUserChanged"
    }
    
    class PushEvents {
        internal static let CLICKED_EVENT = "pushNotificationClicked"
        internal static let DELIVERED_EVENT = "pushNotificationDelivered"
    }
    
    class InboxEvents {
        internal static let INITIAL_LOADING = "inboxInitialLoad"
        internal static let ERROR = "inboxError"
        internal static let MESSAGES_CHANGED = "inboxMessagesChanged"
    }
    
    // Auth Listeners
    private var authListener: CourierAuthenticationListener? = nil
    private var authListeners: [String] = []
    
    // Inbox Listeners
    private var inboxListener: CourierInboxListener? = nil
    private var inboxListeners: [String] = []
    
    private var hasDebuggingListeners = false
    
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

        hasDebuggingListeners = true

        // setup listeners
        Courier.shared.logListener = { log in
            self.sendEvent(
                withName: CourierReactNativeModule.LogEvents.DEBUG_LOG,
                body: log
            )
        }

    }

    override func stopObserving() {

        hasDebuggingListeners = false
        // perform actions after listener is removed
        
    }
    
    private func attachObservers() {
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationClicked),
            name: Notification.Name(rawValue: CourierReactNativeModule.PushEvents.CLICKED_EVENT),
            object: nil
        )
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationDelivered),
            name: Notification.Name(rawValue: CourierReactNativeModule.PushEvents.DELIVERED_EVENT),
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
            name: CourierReactNativeModule.PushEvents.CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        sendMessage(
            name: CourierReactNativeModule.PushEvents.DELIVERED_EVENT,
            message: notification.userInfo
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        
        sendMessage(
            name: CourierReactNativeModule.PushEvents.CLICKED_EVENT,
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

    @objc func addAuthenticationListener() -> String {
        
        // Remove the listener
        authListener?.remove()
        
        // Set the new listener
        authListener = Courier.shared.addAuthenticationListener { [weak self] userId in
            
            self?.sendEvent(
                withName: CourierReactNativeModule.AuthEvents.USER_CHANGED,
                body: userId
            )
            
        }
        
        // Add the listener to the arrau
        let id = UUID().uuidString
        authListeners.append(id)
        
        return id
        
    }
    
    @objc(removeAuthenticationListener:)
    func removeAuthenticationListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        // Remove the item from the array
        if let index = authListeners.firstIndex(of: id) {
            authListeners.remove(at: index)
        }
        
        // Check the length
        if (authListeners.isEmpty) {
            authListener?.remove()
            authListener = nil
        }
        
        return id
        
    }

    @objc(setToken: withToken: withResolver: withRejecter:)
    func setToken(key: NSString, token: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Courier.shared.setToken(
            providerKey: key as String,
            token: token as String,
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
    
    }
    
    @objc(getToken: withResolver: withRejecter:)
    func getToken(key: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let provider = key as String
        
        Task {
            
            let token = await Courier.shared.getToken(providerKey: provider)
            resolve(token)
            
        }
        
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
    
    @objc(readMessage:)
    func readMessage(messageId: NSString) -> String {
        let id = messageId as String
        Courier.shared.readMessage(messageId: id)
        return id
    }
    
    @objc(unreadMessage:)
    func unreadMessage(messageId: NSString) -> String {
        let id = messageId as String
        Courier.shared.unreadMessage(messageId: id)
        return id
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
        
        // Remove the old listener
        inboxListener?.remove()
        
        // Create the new listener
        inboxListener = Courier.shared.addInboxListener(
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
        
        // Track listener id
        let id = UUID().uuidString
        inboxListeners.append(id)
        
        return id
        
    }
    
    @objc(removeInboxListener:)
    func removeInboxListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        // Remove the item from the array
        if let index = inboxListeners.firstIndex(of: id) {
            inboxListeners.remove(at: index)
        }
        
        // Check the length
        if (inboxListeners.isEmpty) {
            inboxListener?.remove()
            inboxListener = nil
        }
        
        return id
        
    }
    
    @objc(refreshInbox: withRejecter:)
    func refreshInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.shared.refreshInbox {
            resolve(nil)
        }
        
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
    
    @objc(getUserPreferences: withResolver: withRejecter:)
    func getUserPreferences(paginationCursor: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let cursor = paginationCursor != "" ? paginationCursor as String : nil
        
        Courier.shared.getUserPreferences(
            paginationCursor: cursor,
            onSuccess: { preferences in
                resolve(preferences.toDictionary())
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc(getUserPreferencesTopic: withResolver: withRejecter:)
    func getUserPreferencesTopic(topicId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Courier.shared.getUserPreferencesTopic(
            topicId: topicId as String,
            onSuccess: { topic in
                resolve(topic.toDictionary())
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }
    
    @objc(putUserPreferencesTopic: withStatus: withHasCustomRouting: withCustomRouting: withResolver: withRejecter:)
        func putUserPreferencesTopic(topicId: NSString, status: NSString, hasCustomRouting: Bool, customRouting: [NSString], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        
        Courier.shared.putUserPreferencesTopic(
            topicId: topicId as String,
            status: CourierUserPreferencesStatus(rawValue: status as String) ?? .unknown,
            hasCustomRouting: hasCustomRouting,
            customRouting: customRouting.map { CourierUserPreferencesChannel(rawValue: $0 as String) ?? .unknown },
            onSuccess: {
                resolve(nil)
            },
            onFailure: { error in
                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
            }
        )
        
    }

    override func supportedEvents() -> [String]! {
        return [
            CourierReactNativeModule.LogEvents.DEBUG_LOG,
            CourierReactNativeModule.AuthEvents.USER_CHANGED,
            CourierReactNativeModule.PushEvents.CLICKED_EVENT,
            CourierReactNativeModule.PushEvents.DELIVERED_EVENT,
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
