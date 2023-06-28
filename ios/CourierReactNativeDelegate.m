//
//  CourierReactNativeDelegate.m
//  courier-react-native
//
//  Created by Michael Miller on 10/7/22.
//

@import Courier_iOS;
#import "CourierReactNativeDelegate.h"
#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@implementation CourierReactNativeDelegate

NSString *iosForegroundNotificationPresentationOptions = @"iosForegroundNotificationPresentationOptions";
NSUInteger notificationPresentationOptions = UNNotificationPresentationOptionNone;

- (id) init {
    
    self = [super init];
    
    if (self) {
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Register notification center changes
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(notificationPresentationOptionsUpdate:)
            name:iosForegroundNotificationPresentationOptions
            object:nil
        ];
        
        [[Courier shared] isUserSignedIn];
//        [[CourierInbox alloc] init];
        
    }
    
    return(self);
    
}

- (void) notificationPresentationOptionsUpdate:(NSNotification *) notification
{
    if ([[notification name] isEqualToString:iosForegroundNotificationPresentationOptions])
    {
        NSDictionary *userInfo = notification.userInfo;
        notificationPresentationOptions = ((NSNumber *) [userInfo objectForKey:@"options"]).unsignedIntegerValue;
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    
    UNNotificationContent *content = notification.request.content;
    NSDictionary *message = content.userInfo;
    
    [[Courier shared] trackNotificationWithMessage:message event:CourierPushEventDelivered completionHandler:^(NSError *error)
    {
        if (error != nil) {
            [self log:error];
        }
    }
    ];
    
    NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationDelivered" object:nil userInfo:pushNotification];
    
    completionHandler(notificationPresentationOptions);
    
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
    
    UNNotificationContent *content = response.notification.request.content;
    NSDictionary *message = content.userInfo;
    
    [[Courier shared] trackNotificationWithMessage:message event:CourierPushEventClicked completionHandler:^(NSError *error)
    {
        if (error != nil) {
            [self log:error];
        }
    }
    ];
    
    NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:pushNotification];
    
    dispatch_async(dispatch_get_main_queue(), ^{
        completionHandler();
    });
    
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
