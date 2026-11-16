//
//  CourierReactNativeEventEmitter.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/21/24.
//

import UIKit
import Courier_iOS
import React

public class CourierReactNativeEventEmitter: RCTEventEmitter {
    
    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.reactNativeIOS("6.1.2")
        
    }
    
    @objc public override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
