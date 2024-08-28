import Courier_iOS

@objc(CourierSharedModule)
class CourierSharedModule: RCTEventEmitter {
    
    private var nativeEmitters = [String]()
    private var authenticationListeners: [String: CourierAuthenticationListener] = [:]
    private var inboxListeners: [String: CourierInboxListener] = [:]

    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.react_native_ios
                
    }

    override func stopObserving() {
        removeAllAuthenticationListeners()
        removeAllInboxListeners()
    }
    
    // MARK: Client
    
    @objc func getClient() -> String? {
        
        guard let options = Courier.shared.client?.options else {
            return nil
        }
        
        do {
            
            let dictionary = [
                "jwt": options.jwt as Any,
                "clientKey": options.clientKey as Any,
                "userId": options.userId as Any,
                "connectionId": options.connectionId as Any,
                "tenantId": options.tenantId as Any,
                "showLogs": options.showLogs as Any
            ]
            .compactMapValues { $0 }
            
            let jsonData = try JSONSerialization.data(
                withJSONObject: dictionary,
                options: .prettyPrinted
            )
            
            guard let jsonString = String(data: jsonData, encoding: .utf8) else {
                return nil
            }
            
            return jsonString
            
        } catch {
            return nil
        }
        
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
            self?.broadcast(
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
    
    // MARK: Inbox
    
    @objc func getInboxPaginationLimit() -> String {
        return String(describing: Courier.shared.inboxPaginationLimit)
    }
    
    @objc(setInboxPaginationLimit:)
    func setInboxPaginationLimit(limit: Double) -> String {
        Courier.shared.inboxPaginationLimit = Int(limit)
        return String(describing: Courier.shared.inboxPaginationLimit)
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
                self?.broadcast(
                    name: loadingId,
                    body: nil
                )
            },
            onError: { [weak self] error in
                self?.broadcast(
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
                    
                    self?.broadcast(
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
    
    @discardableResult @objc func removeAllInboxListeners() -> String? {
        
        for value in inboxListeners.values {
            value.remove()
        }
        
        inboxListeners.removeAll()
        
        return nil
        
    }
    
    @objc(refreshInbox: withRejecter:)
    func refreshInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            await Courier.shared.refreshInbox()
            resolve(nil)
        }
        
    }
    
    @objc(fetchNextPageOfMessages: withRejecter:)
    func fetchNextPageOfMessages(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            
            do {
                let messages = try await Courier.shared.fetchNextInboxPage()
                resolve(try messages.map { try $0.toJson() ?? "" })
            } catch {
                Rejections.sharedError(reject, error: error)
            }
            
        }
        
    }

    override func supportedEvents() -> [String]! {
        return nativeEmitters
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
