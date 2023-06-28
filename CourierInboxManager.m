//
//  CourierInboxManager.m
//  courier-react-native
//
//  Created by Michael Miller on 3/27/23.
//

@import Courier_iOS;

#import <React/RCTViewManager.h>

@interface RNTMapManager : RCTViewManager
@end

@implementation RNTMapManager

RCT_EXPORT_MODULE(CourierInbox)

- (UIView *)view
{
  return [[CourierInbox alloc] init];
}

@end
