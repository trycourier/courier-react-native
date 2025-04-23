//
//  CourierSystemModule.swift
//  courier-react-native
//
//  Created by Michael Miller on 8/27/24.
//

import Courier_iOS
import React

@objc(CourierSystemModule)
class CourierSystemModule: CourierReactNativeEventEmitter {
    
    private var isReactNativeReady: Bool = false
    private var lastClickedMessage: [AnyHashable: Any]? = nil
    private var notificationCenter: NotificationCenter {
        get { return NotificationCenter.default }
    }

    override init() {
        super.init()
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
        
        notificationCenter.addObserver(
            self,
            selector: #selector(onReactNativeReady),
            name: NSNotification.Name(rawValue: "RCTContentDidAppearNotification"),
            object: nil
        )

        notificationCenter.addObserver(
            self,
            selector: #selector(onBridgeWillReload),
            name: NSNotification.Name(rawValue: "RCTBridgeWillReloadNotification"),
            object: nil
        )
        
    }
    
    // MARK: - RN Lifecycle Notifications

    @objc private func onReactNativeReady(_ notification: Notification) {
        isReactNativeReady = true
    }

    @objc private func onBridgeWillReload(_ notification: Notification) {
        isReactNativeReady = false
    }
    
    @objc private func pushNotificationClicked(notification: Notification) {
        
        // Cache the last clicked message
        lastClickedMessage = notification.userInfo
        
        guard let message = lastClickedMessage else {
            return
        }
        
        self.broadcast(
            name: PushEvents.CLICKED_EVENT,
            message: message
        )
        
    }

    @objc private func pushNotificationDelivered(notification: Notification) {
        
        guard let message = notification.userInfo else {
            return
        }
        
        self.broadcast(
            name: PushEvents.DELIVERED_EVENT,
            message: message
        )
        
    }
    
    @objc func registerPushNotificationClickedOnKilledState() {
        let pollInterval: UInt64 = 250_000_000  // 250ms
        let timeout: UInt64 = 10_000_000_000    // 10s

        // Poll until react native is ready
        Task.detached(priority: .background) { [weak self] in
            guard let self else { return }

            let start = DispatchTime.now().uptimeNanoseconds

            // Hold until react native is ready
            while !self.isReactNativeReady, DispatchTime.now().uptimeNanoseconds - start < timeout {
                try? await Task.sleep(nanoseconds: pollInterval)
            }

            // If possible, broadcast the message
            await MainActor.run {
                guard self.isReactNativeReady, let message = self.lastClickedMessage else {
                    NSLog("[Courier] Timed out waiting for React Native or no message available.")
                    return
                }

                self.broadcast(name: PushEvents.CLICKED_EVENT, message: message)
            }
        }
    }
    
    // MARK: Open App
    
    @objc func openSettingsForApp() {
        DispatchQueue.main.async {
            Courier.openSettingsForApp()
        }
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
    
}
