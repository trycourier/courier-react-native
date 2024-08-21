import Courier_iOS

@objc(CourierReactNativeModule)
class CourierReactNativeModule: RCTEventEmitter {

    private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
    
    class LogEvents {
        internal static let DEBUG_LOG = "courierDebugEvent"
    }
    
    class PushEvents {
        internal static let CLICKED_EVENT = "pushNotificationClicked"
        internal static let DELIVERED_EVENT = "pushNotificationDelivered"
    }
    
    private var events = [String]()
    
    // Listeners
    private var authListeners: [String: CourierAuthenticationListener] = [:]
    private var inboxListeners: [String: CourierInboxListener] = [:]
    
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

//        // Setup debug listeners
//        Courier.shared.logListener = { log in
//            self.broadcastEvent(
//                name: CourierReactNativeModule.LogEvents.DEBUG_LOG,
//                body: log
//            )
//        }

    }

    override func stopObserving() {
        removeAuthListeners()
        removeInboxListeners()
    }
    
    private func removeAuthListeners() {
        
        authListeners.forEach { key, value in
            value.remove()
        }
        
        authListeners.removeAll()
        
    }
    
    private func removeInboxListeners() {
        
        inboxListeners.forEach { key, value in
            value.remove()
        }
        
        inboxListeners.removeAll()
        
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
        return "TODO"
//        Courier.shared.isDebugging = isDebugging
//        return String(describing: Courier.shared.isDebugging)
    }
    
    private func sendMessage(name: String, message: [AnyHashable: Any]?) {
        
        guard let message = message else {
            return
        }
     
        do {
            broadcastEvent(
                name: name,
                body: try message.toString()
            )
        } catch {
//            Courier.log(String(describing: error))
        }
        
    }
    
    private func broadcastEvent(name: String, body: Any?) {
        
        if (!supportedEvents().contains(name)) {
            return
        }
        
        sendEvent(
            withName: name,
            body: body
        )
        
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

    @objc(signIn: withClientKey: withUserId: withTenantId: withResolver: withRejecter:)
    func signIn(accessToken: NSString, clientKey: NSString?, userId: NSString, tenantId: NSString?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      
//        Courier.shared.signIn(
//           accessToken: accessToken as String,
//           clientKey: clientKey as? String,
//           userId: userId as String,
//           tenantId: tenantId as? String
//        ) {
//            resolve(nil)
//        }
      
    }

    @objc(signOut: withRejecter:)
    func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
//        Courier.shared.signOut {
//            resolve(nil)
//        }
        
    }

    @objc func getUserId() -> String? {
        return Courier.shared.userId
    }
    
    @objc func getTenantId() -> String? {
        return Courier.shared.tenantId
    }

    @objc(addAuthenticationListener:)
    func addAuthenticationListener(authId: String) -> String {
        
        events.append(authId)
        
        let listener = Courier.shared.addAuthenticationListener { [weak self] userId in
            self?.broadcastEvent(
                name: authId,
                body: userId
            )
        }
        
        let id = UUID().uuidString
        authListeners[id] = listener
        
        return id
        
    }
    
    @objc(removeAuthenticationListener:)
    func removeAuthenticationListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        let listener = authListeners[id]
        
        // Disable the listener
        listener?.remove()
        
        // Remove the id from the map
        authListeners.removeValue(forKey: id)
        
        return id
        
    }

    @objc(setToken: withToken: withResolver: withRejecter:)
    func setToken(key: NSString, token: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
//        Courier.shared.setToken(
//            providerKey: key as String,
//            token: token as String,
//            onSuccess: {
//                resolve(nil)
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
    
    }
    
    @objc(getToken: withResolver: withRejecter:)
    func getToken(key: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let provider = key as String
        
        Task {
            
//            let token = await Courier.shared.getToken(providerKey: provider)
//            resolve(token)
            
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
    
    @objc(clickMessage:)
    func clickMessage(messageId: NSString) -> String {
        let id = messageId as String
//        Courier.shared.clickMessage(messageId: id)
        return id
    }
    
    @objc(readMessage:)
    func readMessage(messageId: NSString) -> String {
        let id = messageId as String
//        Courier.shared.readMessage(messageId: id)
        return id
    }
    
    @objc(unreadMessage:)
    func unreadMessage(messageId: NSString) -> String {
        let id = messageId as String
//        Courier.shared.unreadMessage(messageId: id)
        return id
    }
    
    @objc(readAllInboxMessages: withRejecter:)
    func readAllInboxMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
//        Courier.shared.readAllInboxMessages(
//            onSuccess: {
//                resolve(nil)
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }
    
    @objc(addInboxListener: withErrorId: withMessagesId:)
    func addInboxListener(loadingId: String, errorId: String, messagesId: String) -> String {
        
        // Add the events
        events.append(contentsOf: [loadingId, errorId, messagesId])
        
        // Create the new listener
        let listener = Courier.shared.addInboxListener(
            onInitialLoad: { [weak self] in
                
                self?.broadcastEvent(
                    name: loadingId,
                    body: nil
                )
                
            },
            onError: { [weak self] error in
                     
                self?.broadcastEvent(
                    name: errorId,
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
                
                self?.broadcastEvent(
                    name: messagesId,
                    body: json
                )
                
            }
        )
        
        let id = UUID().uuidString
        inboxListeners[id] = listener
        
        return id
        
    }
    
    @objc(removeInboxListener:)
    func removeInboxListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        let listener = inboxListeners[id]
        
        // Disable the listener
        listener?.remove()
        
        // Remove the id from the map
        inboxListeners.removeValue(forKey: id)
        
        return id
        
    }
    
    @objc(refreshInbox: withRejecter:)
    func refreshInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
//        Courier.shared.refreshInbox {
//            resolve(nil)
//        }
        
    }
    
    @objc(fetchNextPageOfMessages: withRejecter:)
    func fetchNextPageOfMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
//        Courier.shared.fetchNextPageOfMessages(
//            onSuccess: { messages in
//                resolve(messages.map { $0.toDictionary() })
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }
    
    @objc(setInboxPaginationLimit:)
    func setInboxPaginationLimit(limit: Double) -> String {
        Courier.shared.inboxPaginationLimit = Int(limit)
        return String(describing: Courier.shared.inboxPaginationLimit)
    }
    
    @objc(getUserPreferences: withResolver: withRejecter:)
    func getUserPreferences(paginationCursor: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let cursor = paginationCursor != "" ? paginationCursor as String : nil
        
//        Courier.shared.getUserPreferences(
//            paginationCursor: cursor,
//            onSuccess: { preferences in
//                resolve(preferences.toDictionary())
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }
    
    @objc(getUserPreferencesTopic: withResolver: withRejecter:)
    func getUserPreferencesTopic(topicId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
//        Courier.shared.getUserPreferencesTopic(
//            topicId: topicId as String,
//            onSuccess: { topic in
//                resolve(topic.toDictionary())
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }
    
    @objc(putUserPreferencesTopic: withStatus: withHasCustomRouting: withCustomRouting: withResolver: withRejecter:)
    func putUserPreferencesTopic(topicId: NSString, status: NSString, hasCustomRouting: Bool, customRouting: [NSString], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

//        Courier.shared.putUserPreferencesTopic(
//            topicId: topicId as String,
//            status: CourierUserPreferencesStatus(rawValue: status as String) ?? .unknown,
//            hasCustomRouting: hasCustomRouting,
//            customRouting: customRouting.map { CourierUserPreferencesChannel(rawValue: $0 as String) ?? .unknown },
//            onSuccess: {
//                resolve(nil)
//            },
//            onFailure: { error in
//                reject(String(describing: error), CourierReactNativeModule.COURIER_ERROR_TAG, nil)
//            }
//        )
        
    }

    override func supportedEvents() -> [String]! {
        
        // Built in events
        var allEvents = [
            CourierReactNativeModule.LogEvents.DEBUG_LOG,
            CourierReactNativeModule.PushEvents.CLICKED_EVENT,
            CourierReactNativeModule.PushEvents.DELIVERED_EVENT
        ]
        
        allEvents.append(contentsOf: events)
//        let authIds = authListeners.map { $0.value.authId }
//        events.append(contentsOf: authIds)
        
        return allEvents
        
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
