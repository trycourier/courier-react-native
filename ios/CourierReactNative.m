#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CourierReactNative, NSObject)

RCT_EXTERN_METHOD(signIn:(NSString*)userId
                  accessToken:(NSString*)accessToken
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
                  
RCT_EXTERN_METHOD(signOut: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUserId: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFcmToken: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
                  
RCT_EXTERN_METHOD(getApnsToken: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getNotificationPermissionStatus: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)




+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
