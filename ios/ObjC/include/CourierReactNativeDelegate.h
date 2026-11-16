//
//  CourierReactNativeDelegate.h
//  courier-react-native
//
//  Created by Michael Miller on 8/29/23.
//

// React Native's SwiftPM mode exposes the header as <React/RCTAppDelegate.h>
#if __has_include(<React/RCTAppDelegate.h>)
#import <React/RCTAppDelegate.h>
#else
#import "RCTAppDelegate.h"
#endif
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

@interface CourierReactNativeDelegate : RCTAppDelegate<UNUserNotificationCenterDelegate>

@end

NS_ASSUME_NONNULL_END
