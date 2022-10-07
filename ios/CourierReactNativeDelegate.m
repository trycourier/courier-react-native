//
//  CourierReactNativeDelegate.m
//  trycourier-courier-react-native
//
//  Created by Michael Miller on 10/7/22.
//

#import "CourierReactNativeDelegate.h"

#pragma GCC diagnostic ignored "-Wprotocol"
#pragma clang diagnostic ignored "-Wprotocol"

@implementation CourierReactNativeDelegate

//- (instancetype)init
//{
//    NSLog(@"Start!");
//}

- (id) init {
    self = [super init];
    if (self) {
        NSLog(@"_init: %@", self);
    }
    return(self);
}

//- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
//    NSLog(@"YAY!");
//    return YES;
//}

- (void) test
{
    NSLog(@"Hellow!");
}

//- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
//{
//#if DEBUG
//  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
//#else
//  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
//#endif
//}

@end
