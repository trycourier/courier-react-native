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
    
    @objc(getBrand: withBrandId: withResolver: withRejecter:)
    func getBrand(clientId: NSString, brandId: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        
        guard let client = clients[clientId as String] else {
            Rejections.missingClient(reject)
            return
        }
        
        let id = brandId as String
        
        Task {
            do {
                let brand = try await client.brands.getBrand(brandId: id)
                let json = try brand.toJson()
                resolve(json)
            } catch {
                Rejections.apiError(reject, error: error)
            }
        }
        
    }
    
}
