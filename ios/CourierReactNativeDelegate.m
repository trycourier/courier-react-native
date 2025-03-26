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

@interface CourierReactNativeDelegate ()

@property (nonatomic, copy) NSString *iosForegroundNotificationPresentationOptions;
@property (nonatomic, assign) UNNotificationPresentationOptions notificationPresentationOptions;

@end

@implementation CourierReactNativeDelegate

- (id) init {
    
    self = [super init];
    
    if (self) {
        
        // Set the user agent
        Courier.agent = [CourierAgent reactNativeIOS:@"5.5.2"];
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Register notification center changes
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(notificationPresentationOptionsUpdate:)
            name:_iosForegroundNotificationPresentationOptions
            object:nil
        ];
        
    }
    
    return(self);
    
}

- (void) notificationPresentationOptionsUpdate:(NSNotification *) notification
{
    if ([[notification name] isEqualToString:_iosForegroundNotificationPresentationOptions])
    {
        NSDictionary *userInfo = notification.userInfo;
        _notificationPresentationOptions = ((NSNumber *) [userInfo objectForKey:@"options"]).unsignedIntegerValue;
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    
    UNNotificationContent *content = notification.request.content;
    NSDictionary *message = content.userInfo;
    
    [message trackMessageWithEvent:CourierTrackingEventDelivered completion:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"Error tracking message: %@", error.localizedDescription);
        }
    }];
    
    dispatch_async(dispatch_get_main_queue(), ^{
    
        NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationDelivered" object:nil userInfo:pushNotification];
        
        completionHandler(self->_notificationPresentationOptions);
        
    });
    
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
    
    UNNotificationContent *content = response.notification.request.content;
    NSDictionary *message = content.userInfo;
    
    [message trackMessageWithEvent:CourierTrackingEventClicked completion:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"Error tracking message: %@", error.localizedDescription);
        }
    }];

    dispatch_async(dispatch_get_main_queue(), ^{

        NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:pushNotification];

        completionHandler();

    });
    
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"Failed to rgister for remote notification token: %@", error.localizedDescription);
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [Courier setAPNSToken:deviceToken];
}

@end
