//
//  CourierClientModule.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/21/24.
//

import Courier_iOS

@objc(CourierClientModule)
internal class CourierClientModule: CourierReactNativeEventEmitter {
    
    private var clients: [String: CourierClient] = [:]
    
    @objc(addClient:)
    func addClient(options: NSDictionary) -> String {
        
        guard let userId = options["userId"] as? String, let showLogs = options["showLogs"] as? Bool else {
            return "invalid"
        }
        
        let client = CourierClient(
            jwt: options["jwt"] as? String,
            clientKey: options["clientKey"] as? String,
            userId: userId,
            connectionId: options["connectionId"] as? String,
            tenantId: options["tenantId"] as? String,
            showLogs: showLogs
        )
        
        let uuid = UUID().uuidString
        clients[uuid] = client
        
        return uuid
        
    }
    
    @objc(removeClient:)
    func removeClient(clientId: NSString) -> String {
        let id = clientId as String
        clients.removeValue(forKey: id)
        return id
    }
    
    // MARK: Tokens
        
    @objc(putUserToken:withToken:withProvider:withDevice:withResolver:withRejecter:)
    func putUserToken(clientId: NSString, token: NSString, provider: NSString, device: NSDictionary?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let courierDevice: CourierDevice? = device.flatMap {
            CourierDevice(
                appId: $0["appId"] as? String,
                adId: $0["adId"] as? String,
                deviceId: $0["deviceId"] as? String,
                platform: $0["platform"] as? String,
                manufacturer: $0["manufacturer"] as? String,
                model: $0["model"] as? String
            )
        }
        
        let token = token as String
        let provider = provider as String
        
        Task {
            do {
                try await client.tokens.putUserToken(
                    token: token,
                    provider: provider,
                    device: courierDevice ?? CourierDevice()
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
        
    }
    
    @objc(deleteUserToken:withToken:withResolver:withRejecter:)
    func deleteUserToken(clientId: NSString, token: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let token = token as String
        
        Task {
            do {
                try await client.tokens.deleteUserToken(
                    token: token
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    // MARK: Barnd
    
    @objc(getBrand:withBrandId:withResolver:withRejecter:)
    func getBrand(clientId: NSString, brandId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let brandId = brandId as String
        
        Task {
            do {
                let brand = try await client.brands.getBrand(
                    brandId: brandId
                )
                let json = try brand.toJson()
                resolve(json)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
        
    }
    
    // MARK: Inbox
        
    @objc(getMessages:withPaginationLimit:withStartCursor:withResolver:withRejecter:)
    func getMessages(clientId: NSString, paginationLimit: Double, startCursor: NSString?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let limit = Int(paginationLimit)
        let startCursor = startCursor as? String
        
        Task {
            do {
                let res = try await client.inbox.getMessages(
                    paginationLimit: limit,
                    startCursor: startCursor
                )
//                let json = try res.toJson()
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(getArchivedMessages:withPaginationLimit:withStartCursor:withResolver:withRejecter:)
    func getArchivedMessages(clientId: NSString, paginationLimit: Double, startCursor: NSString?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let limit = Int(paginationLimit)
        let startCursor = startCursor as? String
        
        Task {
            do {
                let res = try await client.inbox.getArchivedMessages(
                    paginationLimit: limit,
                    startCursor: startCursor
                )
//                let json = try res.toJson()
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(getMessageById:withMessageId:withResolver:withRejecter:)
    func getMessageById(clientId: NSString, messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        
        Task {
            do {
                let res = try await client.inbox.getMessage(messageId: messageId)
//                let json = try res.toJson()
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(getUnreadMessageCount:withResolver:withRejecter:)
    func getUnreadMessageCount(clientId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        Task {
            do {
                let count = try await client.inbox.getUnreadMessageCount()
                resolve(count)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(openMessage:withMessageId:withResolver:withRejecter:)
    func openMessage(clientId: NSString, messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        
        Task {
            do {
                try await client.inbox.open(
                    messageId: messageId
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(readMessage:withMessageId:withResolver:withRejecter:)
    func readMessage(clientId: NSString, messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        
        Task {
            do {
                try await client.inbox.read(
                    messageId: messageId
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(unreadMessage:withMessageId:withResolver:withRejecter:)
    func unreadMessage(clientId: NSString, messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        
        Task {
            do {
                try await client.inbox.unread(
                    messageId: messageId
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(clickMessage:withMessageId:withTrackingId:withResolver:withRejecter:)
    func clickMessage(clientId: NSString, messageId: NSString, trackingId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        let trackingId = trackingId as String
        
        Task {
            do {
                try await client.inbox.click(
                    messageId: messageId,
                    trackingId: trackingId
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(archiveMessage:withMessageId:withResolver:withRejecter:)
    func archiveMessage(clientId: NSString, messageId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let messageId = messageId as String
        
        Task {
            do {
                try await client.inbox.archive(
                    messageId: messageId
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(readAllMessages:withResolver:withRejecter:)
    func readAllMessages(clientId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        Task {
            do {
                try await client.inbox.readAll()
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(getUserPreferences:withPaginationCursor:withResolver:withRejecter:)
    func getUserPreferences(clientId: NSString, paginationCursor: NSString?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let paginationCursor = paginationCursor as? String
        
        Task {
            do {
                let res = try await client.preferences.getUserPreferences(
                    paginationCursor: paginationCursor
                )
                let json = try res.toJson()
                resolve(json)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(getUserPreferenceTopic:withTopicId:withResolver:withRejecter:)
    func getUserPreferenceTopic(clientId: NSString, topicId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let topicId = topicId as String
        
        Task {
            do {
                let res = try await client.preferences.getUserPreferenceTopic(
                    topicId: topicId
                )
                let json = try res.toJson()
                resolve(json)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(putUserPreferenceTopic:withTopicId:withStatus:withHasCustomRouting:withCustomRouting:withResolver:withRejecter:)
    func putUserPreferenceTopic(clientId: NSString, topicId: NSString, status: NSString, hasCustomRouting: Bool, customRouting: NSArray, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let topicId = topicId as String
        let status = status as String
        let customRouting = customRouting.compactMap { CourierUserPreferencesChannel.init(rawValue: $0 as! String) }
        
        Task {
            do {
                try await client.preferences.putUserPreferenceTopic(
                    topicId: topicId,
                    status: CourierUserPreferencesStatus.init(rawValue: status) ?? .unknown,
                    hasCustomRouting: hasCustomRouting,
                    customRouting: customRouting
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
    @objc(postTrackingUrl:withUrl:withEvent:withResolver:withRejecter:)
    func postTrackingUrl(clientId: NSString, url: NSString, event: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let url = url as String
        let event = event as String
        
        Task {
            do {
                try await client.tracking.postTrackingUrl(
                    url: url,
                    event: CourierTrackingEvent(rawValue: event) ?? .clicked
                )
                resolve(nil)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
    }
    
}
