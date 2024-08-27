import Courier_iOS

@objc(CourierSharedModule)
class CourierSharedModule: RCTEventEmitter {
    
    class LogEvents {
        internal static let DEBUG_LOG = "courierDebugEvent"
    }
    
    class PushEvents {
        internal static let CLICKED_EVENT = "pushNotificationClicked"
        internal static let DELIVERED_EVENT = "pushNotificationDelivered"
    }
    
    private var nativeEmitters = [String]()
    
    private var lastClickedMessage: [AnyHashable: Any]? = nil
    private var notificationCenter: NotificationCenter {
        get {
            return NotificationCenter.default
        }
    }
    
    // Listeners
    private var authenticationListeners: [String: CourierAuthenticationListener] = [:]
    private var inboxListeners: [String: CourierInboxListener] = [:]

    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.react_native_ios
        
        // Attach the listeners
        attachObservers()
                
    }

    override func stopObserving() {
        removeAllAuthenticationListeners()
        removeInboxListeners()
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
            name: Notification.Name(rawValue: CourierSharedModule.PushEvents.CLICKED_EVENT),
            object: nil
        )
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationDelivered),
            name: Notification.Name(rawValue: CourierSharedModule.PushEvents.DELIVERED_EVENT),
            object: nil
        )
        
    }

    @objc private func pushNotificationClicked(notification: Notification) {
        
        lastClickedMessage = notification.userInfo
        sendMessage(
            name: CourierSharedModule.PushEvents.CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        sendMessage(
            name: CourierSharedModule.PushEvents.DELIVERED_EVENT,
            message: notification.userInfo
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        
        sendMessage(
            name: CourierSharedModule.PushEvents.CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }
    
    @objc(getNotificationPermissionStatus:withRejecter:)
    func getNotificationPermissionStatus(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.getNotificationPermissionStatus { status in
            resolve(status.name)
        }
        
    }

    @objc(requestNotificationPermission:withRejecter:)
    func requestNotificationPermission(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Courier.requestNotificationPermission { status in
            resolve(status.name)
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
    
    // MARK: Authentication
    
    @objc func getUserId() -> String? {
        return Courier.shared.userId
    }
    
    @objc func getTenantId() -> String? {
        return Courier.shared.tenantId
    }
    
    @objc func getIsUserSignedIn() -> String {
        return String(Courier.shared.isUserSignedIn)
    }

    @objc(signIn:withClientKey:withUserId:withTenantId:withShowLogs:withResolver:withRejecter:)
    func signIn(accessToken: NSString, clientKey: NSString?, userId: NSString, tenantId: NSString?, showLogs: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        let userId = userId as String
        let tenantId = tenantId as? String
        let accessToken = accessToken as String
        let clientKey = clientKey as? String
        
        Task {
            
            await Courier.shared.signIn(
                userId: userId,
                tenantId: tenantId,
                accessToken: accessToken,
                clientKey: clientKey,
                showLogs: showLogs
            )
            
            resolve(nil)
            
        }
      
    }

    @objc(signOut:withRejecter:)
    func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            await Courier.shared.signOut()
            resolve(nil)
        }
        
    }

    @objc(addAuthenticationListener:)
    func addAuthenticationListener(listenerId: String) -> String {
        
        nativeEmitters.append(listenerId)
        
        let listener = Courier.shared.addAuthenticationListener { [weak self] userId in
            self?.broadcastEvent(
                name: listenerId,
                body: userId
            )
        }
        
        authenticationListeners[listenerId] = listener
        
        return listenerId
        
    }
    
    @objc(removeAuthenticationListener:)
    func removeAuthenticationListener(listenerId: NSString) -> String {
        
        let id = listenerId as String
        
        let listener = authenticationListeners[id]
        
        // Disable the listener
        listener?.remove()
        
        // Remove the id from the map
        authenticationListeners.removeValue(forKey: id)
        
        return id
        
    }
    
    @discardableResult @objc func removeAllAuthenticationListeners() -> String? {
        
        for value in authenticationListeners.values {
            value.remove()
        }
        
        authenticationListeners.removeAll()
        
        return nil
        
    }
    
    // MARK: Push
    
    @objc(getAllTokens:withRejecter:)
    func getAllTokens(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            
            let tokens = await Courier.shared.tokens
            resolve(tokens)
            
        }
        
    }
    
    @objc(getToken:withResolver:withRejecter:)
    func getToken(provider: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let provider = provider as String
        
        Task {
            
            let token = await Courier.shared.getToken(for: provider)
            resolve(token)
            
        }
        
    }

    @objc(setToken:withToken:withResolver:withRejecter:)
    func setToken(provider: NSString, token: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let provider = provider as String
        let token = token as String
        
        Task {
            
            do {
                
                try await Courier.shared.setToken(
                    for: provider,
                    token: token
                )
                
                resolve(nil)
                
            } catch {
                
                Rejections.sharedError(reject, error: error)
                
            }
            
        }
    
    }
    
    @objc(openMessage:withResolver:withRejecter:)
    func openMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let id = messageId as String
        
        Task {
            do {
                try await Courier.shared.openMessage(id)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(archiveMessage:withResolver:withRejecter:)
    func archiveMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let id = messageId as String
        
        Task {
            do {
                try await Courier.shared.archiveMessage(id)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(clickMessage:withResolver:withRejecter:)
    func clickMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let id = messageId as String
        
        Task {
            do {
                try await Courier.shared.clickMessage(id)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(readMessage:withResolver:withRejecter:)
    func readMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        let id = messageId as String
        
        Task {
            do {
                try await Courier.shared.readMessage(id)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(unreadMessage:withResolver:withRejecter:)
    func unreadMessage(messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {

        let id = messageId as String
        
        Task {
            do {
                try await Courier.shared.readMessage(id)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(readAllInboxMessages:withRejecter:)
    func readAllInboxMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.readAllInboxMessages()
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(addInboxListener: withErrorId: withMessagesId:)
    func addInboxListener(loadingId: String, errorId: String, messagesId: String) -> String {
        
        // Add the events
        nativeEmitters.append(contentsOf: [loadingId, errorId, messagesId])
        
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
                
                do {
                    
                    let json: [String: Any] = [
                        "messages": try messages.map { try $0.toJson() ?? "" },
                        "unreadMessageCount": unreadMessageCount,
                        "totalMessageCount": totalMessageCount,
                        "canPaginate": canPaginate
                    ]
                    
                    self?.broadcastEvent(
                        name: messagesId,
                        body: json
                    )
                    
                } catch {
                    
                    Courier.shared.client?.error(error.localizedDescription)
                    
                }
                
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

    override func supportedEvents() -> [String]! {
        
        var allEvents = [
            CourierSharedModule.LogEvents.DEBUG_LOG,
            CourierSharedModule.PushEvents.CLICKED_EVENT,
            CourierSharedModule.PushEvents.DELIVERED_EVENT
        ]
        
        allEvents.append(contentsOf: nativeEmitters)
        
        return allEvents
        
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    // MARK: Broadcasting
    
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
            Courier.shared.client?.log(String(describing: error))
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
