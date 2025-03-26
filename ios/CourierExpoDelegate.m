//
//  CourierExpoDelegate.m
//  courier-react-native
//
//  Created by Michael Miller on 3/25/25.
//

#import "CourierExpoDelegate.h"

@import Courier_iOS;

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

@implementation CourierExpoDelegate

NSString *expoIosForegroundNotificationPresentationOptions = @"iosForegroundNotificationPresentationOptions";
NSUInteger expoNotificationPresentationOptions = UNNotificationPresentationOptionNone;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Set the Courier user agent
  Courier.agent = [CourierAgent reactNativeIOS:@"5.4.3"];
  
  // Register for remote notifications
  [application registerForRemoteNotifications];
  
  // Set the UNUserNotificationCenter delegate
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  // Observe changes to the iOS foreground notification presentation options
  [[NSNotificationCenter defaultCenter]
      addObserver:self
      selector:@selector(notificationPresentationOptionsUpdate:)
      name:expoIosForegroundNotificationPresentationOptions
      object:nil
  ];
  
  // Standard Expo/RN setup
  self.moduleName = @"main";
  self.initialProps = @{};
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

#pragma mark - Custom Courier / Notification Methods

- (void)notificationPresentationOptionsUpdate:(NSNotification *)notification
{
  if ([[notification name] isEqualToString:expoIosForegroundNotificationPresentationOptions]) {
    NSDictionary *userInfo = notification.userInfo;
    expoNotificationPresentationOptions = ((NSNumber *)[userInfo objectForKey:@"options"]).unsignedIntegerValue;
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
        
        completionHandler(expoNotificationPresentationOptions);
        
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
