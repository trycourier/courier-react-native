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
#import "React/RCTRootView.h"

@implementation CourierReactNativeDelegate

- (id) init {


   [NSTimer scheduledTimerWithTimeInterval:6.0  target:self selector:@selector(actionTimer) userInfo:nil repeats:YES];

    self = [super init];
    if (self) {
        
        // Register for remote notifications
        UIApplication *app = [UIApplication sharedApplication];
        [app registerForRemoteNotifications];
        
        // Register notification center changes
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = self;
        
//      [[NSNotificationCenter defaultCenter] addObserver:self
//          selector:@selector(receiveTestNotification:)
//          name:@"TestNotification"
//          object:nil];
        
    }
    return(self);
}

int num = 10;

//- (void) receiveTestNotification:(NSNotification *) notification
//{
//    // [notification name] should always be @"TestNotification"
//    // unless you use this method for observation of other notifications
//    // as well.
//
//    if ([[notification name] isEqualToString:@"TestNotification"])
//        NSLog (@"Successfully received the test notification!");
//}


-(void)actionTimer
{
  
// NSLog(@"the number is %i", num);
    num+=1;
    
    NSDictionary *userInfo = @{ @"the_number" : @(num) };
    
//    [[NSNotificationCenter defaultCenter] postNotificationName:@"TestNotification" object:nil userInfo:userInfo];
    
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
    
    NSDictionary *message = notification.request.content.userInfo;
    
    [[Courier shared] trackNotificationWithMessage:message event:CourierPushEventDelivered completionHandler:^(NSError *error)
    {
        
        if (error != nil) {
            [self log:error];
        }
        else{
          [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationDelivered" object:nil userInfo:message];
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
        }else{
          [[NSNotificationCenter defaultCenter] postNotificationName:@"pushNotificationClicked" object:nil userInfo:message];
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
