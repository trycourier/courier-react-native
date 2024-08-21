//
//  CourierClientModule.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/21/24.
//

import Courier_iOS

@objc(CourierClientModule)
internal class CourierClientModule: CourierReactNativeEventEmitter {
    
    @objc(getBrand:)
    func getBrand(brandId: NSString) -> String {
        let id = brandId as String
//        Courier.shared.readMessage(messageId: id)
        return id
    }
    
}
