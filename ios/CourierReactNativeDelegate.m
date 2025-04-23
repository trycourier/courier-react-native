//
//  CourierReactNativeDelegate.m
//  courier-react-native
//
//  Created by https://github.com/mikemilla on 10/7/22.
//

@import Courier_iOS;
#import "CourierReactNativeDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>

#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@interface CourierReactNativeDelegate ()

@property (nonatomic, assign) UNNotificationPresentationOptions notificationPresentationOptions;
@property (nonatomic, strong) NSDictionary *pendingNotificationClick;
@property (nonatomic, assign) BOOL isReactNativeReady;

@end

@implementation CourierReactNativeDelegate

static NSString *const CourierForegroundOptionsDidChangeNotification = @"iosForegroundNotificationPresentationOptions";

- (id)init {
    self = [super init];
    
    if (self) {
        // Set the user agent
        Courier.agent = [CourierAgent reactNativeIOS:@"5.5.6"];
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Set notification center delegate
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
        // Detect JS bridge load
        self.isReactNativeReady = [self detectIfBridgeIsReady];

        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(onJavaScriptDidLoad:)
            name:RCTJavaScriptDidLoadNotification
            object:nil];

        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(notificationPresentationOptionsUpdate:)
            name:CourierForegroundOptionsDidChangeNotification
            object:nil];
    }
    
    return self;
}

- (BOOL)detectIfBridgeIsReady {
    // RCTBridge currentBridge is non-nil only after JS is loaded
    return [RCTBridge currentBridge] != nil;
}

- (void)notificationPresentationOptionsUpdate:(NSNotification *)notification
{
    NSDictionary *userInfo = notification.userInfo;
    self.notificationPresentationOptions = ((NSNumber *)[userInfo objectForKey:@"options"]).unsignedIntegerValue;
}

- (void)onJavaScriptDidLoad:(NSNotification *)notification
{
    self.isReactNativeReady = YES;

    if (self.pendingNotificationClick) {
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked"
                                                            object:nil
                                                          userInfo:self.pendingNotificationClick];
        self.pendingNotificationClick = nil;
    }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
    UNNotificationContent *content = response.notification.request.content;
    NSDictionary *message = content.userInfo;

    [message trackMessageWithEvent:CourierTrackingEventClicked completion:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"[Courier] Error tracking message: %@", error.localizedDescription);
        }
    }];

    NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];

    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.isReactNativeReady) {
            [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked"
                                                                object:nil
                                                              userInfo:pushNotification];
        } else {
            self.pendingNotificationClick = pushNotification;
        }
        completionHandler();
    });
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    UNNotificationContent *content = notification.request.content;
    NSDictionary *message = content.userInfo;

    [message trackMessageWithEvent:CourierTrackingEventDelivered completion:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"[Courier] Error tracking delivery: %@", error.localizedDescription);
        }
    }];

    dispatch_async(dispatch_get_main_queue(), ^{
        NSDictionary *pushNotification = [Courier formatPushNotificationWithContent:content];
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationDelivered"
                                                            object:nil
                                                          userInfo:pushNotification];
        completionHandler(self.notificationPresentationOptions);
    });
}

- (void)application:(UIApplication *)application
didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"[Courier] Failed to register for remote notifications: %@", error.localizedDescription);
}

- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [Courier setAPNSToken:deviceToken];
}

@end
