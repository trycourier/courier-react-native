//
//  CourierReactNativeDelegate.m
//  trycourier-courier-react-native
//
//  Created by Michael Miller on 10/7/22.
//

@import Courier_iOS;
#import "CourierReactNativeDelegate.h"

#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@implementation CourierReactNativeDelegate

- (id) init {
    self = [super init];
    if (self) {
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Register notification center changes
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
    }
    return(self);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    
    NSDictionary *message = notification.request.content.userInfo;
    
    [[Courier shared] trackNotificationWithMessage:message event:CourierPushEventDelivered completionHandler:^(NSError *error)
    {
        
        if (error != nil) {
            [self log:error];
        }
        
        // TODO: Need variable exposed for making this settable inside React Native javascript.. tbd on how just yet
        if (@available(iOS 14.0, *)) {
            completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionList | UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionBadge);
        } else {
            completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
        }
        
    }
    ];
    
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
    
    NSDictionary *message = response.notification.request.content.userInfo;
    
    [[Courier shared] trackNotificationWithMessage:message event:CourierPushEventClicked completionHandler:^(NSError *error)
    {
        
        if (error != nil) {
            [self log:error];
        }
        
        dispatch_async(dispatch_get_main_queue(), ^{
            completionHandler();
        });
        
    }
    ];
    
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [self log:error];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    
    [[Courier shared]
    setAPNSToken:deviceToken
    onSuccess:^()
    {
        // Empty
    }
    onFailure:^(NSError *error)
    {
        [self log:error];
    }
    ];
    
}

- (void)log: (NSError*)error {
    NSString *err = [NSString stringWithFormat:@"%@", error];
    [Courier log:err];
}

@end
