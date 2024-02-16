//
//  CourierAuthenticationListenerWrapper.swift
//  courier-react-native
//
//  Created by Michael Miller on 2/15/24.
//

import Foundation
import Courier_iOS

internal struct CourierAuthenticationListenerWrapper {
    let authId: String
    let listener: CourierAuthenticationListener
}
