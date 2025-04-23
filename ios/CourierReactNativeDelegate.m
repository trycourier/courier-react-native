//
//  CourierReactNativeDelegate.m
//  courier-react-native
//
//  Created by https://github.com/mikemilla on 10/7/22.
//

@import Courier_iOS;
#import "CourierReactNativeDelegate.h"
#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@interface CourierReactNativeDelegate ()

@property (nonatomic, assign) UNNotificationPresentationOptions notificationPresentationOptions;

@end

@implementation CourierReactNativeDelegate

static NSString *const CourierForegroundOptionsDidChangeNotification = @"iosForegroundNotificationPresentationOptions";

- (id)init {
    self = [super init];
    
    if (self) {
        // Set the user agent
        Courier.agent = [CourierAgent reactNativeIOS:@"5.5.5"];
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Register notification center changes
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(notificationPresentationOptionsUpdate:)
            name:CourierForegroundOptionsDidChangeNotification
            object:nil
        ];
    }
    
    return self;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Killed-state launch support
    [self handleNotificationLaunchFromKilledState:launchOptions];

    return YES;
}

- (void)notificationPresentationOptionsUpdate:(NSNotification *)notification
{
    if ([[notification name] isEqualToString:CourierForegroundOptionsDidChangeNotification])
    {
        NSDictionary *userInfo = notification.userInfo;
        self.notificationPresentationOptions = ((NSNumber *)[userInfo objectForKey:@"options"]).unsignedIntegerValue;
    }
}

/// Handles notification taps when the app launches from a killed state.
/// Call this from AppDelegate's didFinishLaunchingWithOptions using UIApplicationLaunchOptionsRemoteNotificationKey.
- (void)handleNotificationLaunchFromKilledState:(NSDictionary *)launchOptions
{
    NSDictionary *userInfo = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
    if (userInfo) {
        // Track event
        [userInfo trackMessageWithEvent:CourierTrackingEventClicked completion:^(NSError * _Nullable error) {
            if (error) {
                NSLog(@"[Courier] Failed to track message click on cold start: %@", error.localizedDescription);
            }
        }];

        // Create temporary content for formatting
        UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
        content.userInfo = userInfo;

        dispatch_async(dispatch_get_main_queue(), ^{
            NSDictionary *formatted = [Courier formatPushNotificationWithContent:content];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:formatted];
        });
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
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
        completionHandler(self.notificationPresentationOptions);
    });
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
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

- (void)application:(UIApplication *)application
didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"Failed to register for remote notification token: %@", error.localizedDescription);
}

- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [Courier setAPNSToken:deviceToken];
}

@end
