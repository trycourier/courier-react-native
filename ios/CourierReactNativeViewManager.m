#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(CourierReactNativeViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(lightTheme, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(darkTheme, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(onClickInboxMessageAtIndex, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onClickInboxActionForMessageAtIndex, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onScrollInbox, RCTBubblingEventBlock)

@end
