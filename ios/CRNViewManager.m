#import <MapKit/MapKit.h>

#import <React/RCTViewManager.h>

@interface CRNViewManager : RCTViewManager
@end

@implementation CRNViewManager

RCT_EXPORT_MODULE(CRNInboxView)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
