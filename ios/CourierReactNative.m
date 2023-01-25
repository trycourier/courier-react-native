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

RCT_EXTERN_METHOD(setFcmToken:(NSString*)token
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
                  
RCT_EXTERN_METHOD(getApnsToken: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getNotificationPermissionStatus: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestNotificationPermission: (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(sendPush: (NSString*)authKey
                  withUserId:(NSString*)userId
                  withTitle:(NSString*)title
                  withBody:(NSString*)body
                  withProviders:(NSArray*)providers
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(registerPushNotificationClickedOnKilledState)
RCT_EXTERN_METHOD(iOSForegroundPresentationOptions: (NSDictionary*) params)
RCT_EXTERN_METHOD(setDebugMode: (BOOL)isDebugging
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)


+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
