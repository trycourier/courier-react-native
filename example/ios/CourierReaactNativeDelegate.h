//
//  CourierReactNativeDelegate.h
//  courier-react-native
//
//  Created by Michael Miller on 10/7/22.
//

#import <UIKit/UIKit.h>
#import <React/RCTBridgeDelegate.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

@interface CourierReactNativeDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) UIWindow *window;

@end

NS_ASSUME_NONNULL_END
