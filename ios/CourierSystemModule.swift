//
//  CourierSystemModule.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/27/24.
//

import Courier_iOS

@objc(CourierSystemModule)
class CourierSystemModule: RCTEventEmitter {
    
    private var lastClickedMessage: [AnyHashable: Any]? = nil
    private var notificationCenter: NotificationCenter {
        get { return NotificationCenter.default }
    }

    override init() {
        super.init()
        
        // Set the user agent
        // Used to know the platform performing requests
        Courier.agent = CourierAgent.react_native_ios
        
        // Attach the listeners
        attachObservers()
                
    }
    
    // MARK: Push Interactions
    
    private func attachObservers() {
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationClicked),
            name: Notification.Name(rawValue: PushEvents.CLICKED_EVENT),
            object: nil
        )
        
        notificationCenter.addObserver(
            self,
            selector: #selector(pushNotificationDelivered),
            name: Notification.Name(rawValue: PushEvents.DELIVERED_EVENT),
            object: nil
        )
        
    }
    
    @objc private func pushNotificationClicked(notification: Notification) {
        
        // Cache the last clicked message
        lastClickedMessage = notification.userInfo
        
        self.broadcast(
            name: PushEvents.CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        self.broadcast(
            name: PushEvents.DELIVERED_EVENT,
            message: notification.userInfo
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        
        broadcast(
            name: PushEvents.CLICKED_EVENT,
            message: lastClickedMessage
        )
        
    }
    
    // MARK: Notification Permissions
    
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
    
    // MARK: Notification Styling
    
    @objc(setIOSForegroundPresentationOptions:)
    func setIOSForegroundPresentationOptions(params: NSDictionary) -> String {
        
        let rawValue = params.toPresentationOptions().rawValue
        NotificationCenter.default.post(
            name: Notification.Name("iosForegroundNotificationPresentationOptions"),
            object: nil,
            userInfo: ["options": rawValue]
        )
        
        return String(describing: rawValue)
        
    }
    
    override func supportedEvents() -> [String]! {
        return [
            PushEvents.CLICKED_EVENT,
            PushEvents.DELIVERED_EVENT
        ]
    }
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
}
