//
//  CourierReactNativeDelegate.m
//  courier-react-native
//
//  Created by https://github.com/mikemilla on 10/7/22.
//

@import Courier_iOS;
#import "CourierReactNativeDelegate.h"
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTUtils.h>

#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@interface CourierReactNativeDelegate ()

@property (nonatomic, assign) UNNotificationPresentationOptions notificationPresentationOptions;
@property (nonatomic, strong) NSDictionary *cachedMessage;
@property (nonatomic, assign) BOOL isReactNativeReady;

@end

@implementation CourierReactNativeDelegate

static NSString *const CourierForegroundOptionsDidChangeNotification = @"iosForegroundNotificationPresentationOptions";

- (id)init {
    self = [super init];
    
    if (self) {
      
        // Set the user agent
        Courier.agent = [CourierAgent reactNativeIOS:@"5.6.2"];
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Set notification center delegate
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;

        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(notificationPresentationOptionsUpdate:)
            name:CourierForegroundOptionsDidChangeNotification
            object:nil];
      
        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(onBridgeWillReload)
            name:RCTBridgeWillReloadNotification
            object:nil];
      
        [[NSNotificationCenter defaultCenter]
            addObserver:self
            selector:@selector(onReactNativeReady:)
            name:RCTContentDidAppearNotification
            object:nil];
    }
    
    return self;
}

// Called when React Native is loaded and ready
- (void)onReactNativeReady:(__unused NSNotification *)note
{
  self.isReactNativeReady = YES;

  // flush anything that was queued while RN was booting
  if (self.cachedMessage) {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:self.cachedMessage];
    self.cachedMessage = nil;
  }
}

// Called when there is a reload to React Native
- (void)onBridgeWillReload
{
  self.isReactNativeReady = NO;
}

- (void)notificationPresentationOptionsUpdate:(NSNotification *)notification
{
    NSDictionary *userInfo = notification.userInfo;
    self.notificationPresentationOptions = ((NSNumber *)[userInfo objectForKey:@"options"]).unsignedIntegerValue;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
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
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:pushNotification];
      } else {
        self.cachedMessage = pushNotification;
      }
      completionHandler();
    });
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
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
        [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationDelivered" object:nil userInfo:pushNotification];
        completionHandler(self.notificationPresentationOptions);
    });
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    NSLog(@"[Courier] Failed to register for remote notifications: %@", error.localizedDescription);
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [Courier setAPNSToken:deviceToken];
}

- (void)dealloc
{
  self.cachedMessage = nil;
  self.isReactNativeReady = NO;
}

@end
