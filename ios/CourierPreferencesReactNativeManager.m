#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(CourierPreferencesViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(mode, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(theme, NSDictionary)

RCT_EXPORT_VIEW_PROPERTY(onScrollPreferences, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onPreferenceError, RCTBubblingEventBlock)


@end
