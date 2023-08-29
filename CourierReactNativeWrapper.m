//
//  CourierReactNativeWrapper.m
//  courier-react-native
//
//  Created by Michael Miller on 8/29/23.
//

#import <Foundation/Foundation.h>

//@import Courier_iOS;

@interface CourierReactNativeWrapper : NSObject

- (void)sayHello;

@end

@implementation CourierReactNativeWrapper

- (void)sayHello {
    NSLog(@"Hello from Objective-C!");
}

@end
