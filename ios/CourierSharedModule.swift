import Courier_iOS

@objc(CourierSharedModule)
class CourierSharedModule: CourierReactNativeEventEmitter {
    
    private var nativeEmitters = [String]()
    private var authenticationListeners: [String: CourierAuthenticationListener] = [:]
    private var inboxListeners: [String: CourierInboxListener] = [:]

    override func stopObserving() {
        removeAuthListeners()
        removeInboxListeners()
    }
  
    @objc(attachEmitter:withResolver:withRejecter:)
    func attachEmitter(emitterId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        nativeEmitters.append(emitterId)
        resolve(emitterId)
        
    }
    
    // MARK: Client
  
    @objc(getClient:withRejecter:)
    func getClient(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
        
            guard let options = await Courier.shared.client?.options else {
                resolve(nil)
                return
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
                    resolve(nil)
                    return
                }
                
                resolve(jsonString)
                  
            } catch {
                resolve(nil)
            }
          
        }
        
    }
    
    // MARK: Authentication
    
    @objc(getUserId:withRejecter:)
    func getUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            let userId = await Courier.shared.userId
            resolve(userId)
        }
    }
    
    @objc(getTenantId:withRejecter:)
    func getTenantId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            let tenantId = await Courier.shared.tenantId
            resolve(tenantId)
        }
    }
    
    @objc(getIsUserSignedIn:withRejecter:)
    func getIsUserSignedIn(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            let isUserSignedIn = await String(Courier.shared.isUserSignedIn)
            resolve(isUserSignedIn)
        }
    }

    @objc(signIn:withClientKey:withUserId:withTenantId:withShowLogs:withResolver:withRejecter:)
    func signIn(accessToken: String, clientKey: String?, userId: String, tenantId: String?, showLogs: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
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

    @objc(addAuthenticationListener:withResolver:withRejecter:)
    func addAuthenticationListener(listenerId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            
            let listener = await Courier.shared.addAuthenticationListener { [weak self] userId in
                self?.broadcast(
                    name: listenerId,
                    body: userId
                )
            }
            
            authenticationListeners[listenerId] = listener
            
            resolve(listenerId)
          
        }
        
    }
    
    @objc(removeAuthenticationListener:withResolver:withRejecter:)
    func removeAuthenticationListener(listenerId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            
            let listener = authenticationListeners[listenerId]
            
            // Disable the listener
            listener?.remove()
            
            // Remove the id from the map
            authenticationListeners.removeValue(forKey: listenerId)
            
            resolve(listenerId)
          
        }
        
    }
    
    @objc(removeAllAuthenticationListeners:withRejecter:)
    func removeAllAuthenticationListeners(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            removeAuthListeners()
            resolve(nil)
        }
    }
  
    private func removeAuthListeners() {
      
        for value in authenticationListeners.values {
            value.remove()
        }
      
        authenticationListeners.removeAll()
      
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
    func getToken(provider: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            let token = await Courier.shared.getToken(for: provider)
            resolve(token)
        }
        
    }

    @objc(setToken:withToken:withResolver:withRejecter:)
    func setToken(provider: String, token: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
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
    
    @objc(getInboxPaginationLimit:withRejecter:)
    func getInboxPaginationLimit(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            let limit = await String(describing: Courier.shared.inboxPaginationLimit)
            resolve(limit)
        }
    }
    
    @objc(setInboxPaginationLimit:withResolver:withRejecter:)
    func setInboxPaginationLimit(limit: Double, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            await Courier.shared.setPaginationLimit(Int(limit))
            let limit = await String(describing: Courier.shared.inboxPaginationLimit)
            resolve(limit)
        }
    }
    
    @objc(openMessage:withResolver:withRejecter:)
    func openMessage(messageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.openMessage(messageId)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(archiveMessage:withResolver:withRejecter:)
    func archiveMessage(messageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.archiveMessage(messageId)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(clickMessage:withResolver:withRejecter:)
    func clickMessage(messageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.clickMessage(messageId)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(readMessage:withResolver:withRejecter:)
    func readMessage(messageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.readMessage(messageId)
                resolve(nil)
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
        
    }
    
    @objc(unreadMessage:withResolver:withRejecter:)
    func unreadMessage(messageId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        Task {
            do {
                try await Courier.shared.unreadMessage(messageId)
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
    
    @objc(addInboxListener:withLoadingId:withErrorId:withUnreadCountId:withFeedId:withArchiveId:withPageAddedId:withMessageChangedId:withMessageAddedId:withMessageRemovedId:withResolver:withRejecter:)
    func addInboxListener(listenerId: String, loadingId: String, errorId: String, unreadCountId: String, feedId: String, archiveId: String, pageAddedId: String, messageChangedId: String, messageAddedId: String, messageRemovedId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            
            // Create the new listener
            let listener = await Courier.shared.addInboxListener(
              onLoading: { [weak self] in
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
              onUnreadCountChanged: { [weak self] unreadCount in
                self?.broadcast(
                    name: unreadCountId,
                    body: unreadCount
                )
              },
              onFeedChanged: { [weak self] set in
                do {
                  let json: [String: Any] = [
                    "messages": try set.messages.map { try $0.toJson() ?? "" },
                    "totalMessageCount": set.totalCount,
                    "canPaginate": set.canPaginate
                  ]
                  self?.broadcast(
                    name: feedId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              },
              onArchiveChanged: { [weak self] set in
                do {
                  let json: [String: Any] = [
                    "messages": try set.messages.map { try $0.toJson() ?? "" },
                    "totalMessageCount": set.totalCount,
                    "canPaginate": set.canPaginate
                  ]
                  self?.broadcast(
                    name: archiveId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              },
              onPageAdded: { [weak self] feed, set in
                do {
                  let json: [String: Any] = [
                    "feed": feed == .archived ? "archived" : "feed",
                    "messages": try set.messages.map { try $0.toJson() ?? "" },
                    "totalMessageCount": set.totalCount,
                    "canPaginate": set.canPaginate
                  ]
                  self?.broadcast(
                    name: pageAddedId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              },
              onMessageChanged: { [weak self] feed, index, message in
                do {
                  let json: [String: Any] = [
                    "feed": feed == .archived ? "archived" : "feed",
                    "index": index,
                    "message": try message.toJson() ?? "",
                  ]
                  self?.broadcast(
                    name: messageChangedId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              },
              onMessageAdded: { [weak self] feed, index, message in
                do {
                  let json: [String: Any] = [
                    "feed": feed == .archived ? "archived" : "feed",
                    "index": index,
                    "message": try message.toJson() ?? "",
                  ]
                  self?.broadcast(
                    name: messageAddedId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              },
              onMessageRemoved: { [weak self] feed, index, message in
                do {
                  let json: [String: Any] = [
                    "feed": feed == .archived ? "archived" : "feed",
                    "index": index,
                    "message": try message.toJson() ?? "",
                  ]
                  self?.broadcast(
                    name: messageRemovedId,
                    body: json
                  )
                } catch {
                  Task {
                    await Courier.shared.client?.error(error.localizedDescription)
                  }
                }
              }
            )
          
            inboxListeners[listenerId] = listener
          
            resolve(listenerId)
          
        }
        
    }
    
    @objc(removeInboxListener:withResolver:withRejecter:)
    func removeInboxListener(listenerId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        Task {
            
            let listener = inboxListeners[listenerId]
            
            // Disable the listener
            listener?.remove()
            
            // Remove the id from the map
            inboxListeners.removeValue(forKey: listenerId)
            
            resolve(listenerId)
          
        }
        
    }
    
    @objc(removeAllInboxListeners:withRejecter:)
    func removeAllInboxListeners(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            removeInboxListeners()
            resolve(nil)
        }
    }
  
    private func removeInboxListeners() {
        for value in inboxListeners.values {
            value.remove()
        }
        inboxListeners.removeAll()
    }
    
    @objc(refreshInbox: withRejecter:)
    func refreshInbox(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            await Courier.shared.refreshInbox()
            resolve(nil)
        }
    }
    
    @objc(fetchNextPageOfMessages:withResolver:withRejecter:)
    func fetchNextPageOfMessages(inboxMessageFeed: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            do {
                let value: InboxMessageFeed = inboxMessageFeed == "archived" ? .feed : .archived
                let messages = try await Courier.shared.fetchNextInboxPage(value)
                resolve(try messages.map { try $0.toJson() ?? "" })
            } catch {
                Rejections.sharedError(reject, error: error)
            }
        }
    }

    override func supportedEvents() -> [String]! {
        return nativeEmitters
    }
    
}
