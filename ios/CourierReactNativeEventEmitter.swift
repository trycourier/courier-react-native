//
//  CourierReactNativeEventEmitter.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/21/24.
//

import Courier_iOS

internal class CourierReactNativeEventEmitter: RCTEventEmitter {
    
    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.react_native_ios
                
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}