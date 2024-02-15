//
//  CourierInboxListenerWrapper.swift
//  courier-react-native
//
//  Created by Michael Miller on 2/15/24.
//

import Foundation
import Courier_iOS

internal struct CourierInboxListenerWrapper {
    let loadingId: String
    let errorId: String
    let messagesId: String
    let listener: CourierInboxListener
}

extension CourierInboxListenerWrapper {
    
    internal func getIds() -> [String] {
        return [loadingId, errorId, messagesId]
    }
    
}
