#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CourierSharedModule, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(
  addEmitter:(NSString *)emitterId
)

RCT_EXTERN_METHOD(
  attachEmitter: (NSString*)emitterId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getClient: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getUserId: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getTenantId: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getIsUserSignedIn: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  signIn: (NSString*)accessToken
  withClientKey: (NSString*)clientKey
  withUserId: (NSString*)userId
  withTenantId: (NSString*)tenantId
  withShowLogs: (BOOL*)showLogs
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  signOut: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  addAuthenticationListener: (NSString*)listenerId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  addAuthenticationListener: (NSString*)authId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeAuthenticationListener: (NSString*)listenerId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeAllAuthenticationListeners: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getAllTokens: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getToken: (NSString*)provider
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  setToken: (NSString*)provider
  withToken: (NSString*)token
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getInboxPaginationLimit: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  setInboxPaginationLimit: (double)limit
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  openMessage: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  archiveMessage: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  clickMessage: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  readMessage: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  unreadMessage: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  readAllInboxMessages: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  addInboxListener: (NSString*)listenerId
  withLoadingId: (NSString*)loadingId
  withErrorId: (NSString*)errorId
  withUnreadCountId: (NSString*)unreadCountId
  withTotalCountId: (NSString*)totalCountId
  withMessagesChangedId: (NSString*)messagesChangedId
  withPageAddedId: (NSString*)pageAddedId
  withMessageEventId: (NSString*)messageEventId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeInboxListener: (NSString*)listenerId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  removeAllInboxListeners: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  refreshInbox: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  fetchNextPageOfMessages: (NSString*)inboxMessageFeed
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_EXTERN_METHOD(setIsUITestsActive:(BOOL)isActive)

@end

@interface RCT_EXTERN_MODULE(CourierClientModule, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(
  addClient: (NSDictionary*)options
)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(
  removeClient: (NSString*)clientId
)

RCT_EXTERN_METHOD(
  putUserToken: (NSString*)clientId
  withToken: (NSString*)token
  withProvider: (NSString*)provider
  withDevice: (NSDictionary*)device
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  deleteUserToken: (NSString*)clientId
  withToken: (NSString*)token
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getBrand: (NSString*)clientId
  withBrandId: (NSString*)brandId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getMessages: (NSString*)clientId
  withPaginationLimit: (double)paginationLimit
  withStartCursor: (NSString*)startCursor
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getArchivedMessages: (NSString*)clientId
  withPaginationLimit: (double)paginationLimit
  withStartCursor: (NSString*)startCursor
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getMessageById: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getUnreadMessageCount: (NSString*)clientId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  openMessage: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  readMessage: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  unreadMessage: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  clickMessage: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withTrackingId: (NSString*)trackingId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  archiveMessage: (NSString*)clientId
  withMessageId: (NSString*)messageId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  readAllMessages: (NSString*)clientId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getUserPreferences: (NSString*)clientId
  withPaginationCursor: (NSString*)paginationCursor
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getUserPreferenceTopic: (NSString*)clientId
  withTopicId: (NSString*)topicId
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  putUserPreferenceTopic: (NSString*)clientId
  withTopicId: (NSString*)topicId
  withStatus: (NSString*)status
  withHasCustomRouting: (BOOL)hasCustomRouting
  withCustomRouting: (NSArray<NSString*>*)customRouting
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  postTrackingUrl: (NSString*)clientId
  withUrl: (NSString*)url
  withEvent: (NSString*)event
  withResolver: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

@interface RCT_EXTERN_MODULE(CourierSystemModule, NSObject)

RCT_EXTERN_METHOD(
  openSettingsForApp
)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(
  setIOSForegroundPresentationOptions: (NSDictionary*)params
)

RCT_EXTERN_METHOD(
  getNotificationPermissionStatus: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  requestNotificationPermission: (RCTPromiseResolveBlock)resolve
  withRejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  registerPushNotificationClickedOnKilledState
)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
