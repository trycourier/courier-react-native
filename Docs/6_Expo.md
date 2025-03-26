# Expo

Details on adding Courier to your Expo app

&emsp;

# iOS

## Push Notifications

If you want to automatically sync [`Push Notification`](https://github.com/trycourier/courier-react-native/blob/master/Docs/3_PushNotifications.md) tokens you will need to update your `AppDelegate` files.

&emsp;

`AppDelegate.h`

```objc
#import <Expo/Expo.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <courier-react-native/CourierReactNativeDelegate.h>

@interface AppDelegate : EXAppDelegateWrapper <UNUserNotificationCenterDelegate>

// Add a property for the Courier delegate so we can forward calls
@property (nonatomic, strong) CourierReactNativeDelegate *courierDelegate;

@end
```

`AppDelegate.mm`

```objc
#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <IntercomModule.h>
#import "RNBootSplash.h"
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";
  self.initialProps = @{};

  // Instantiate CourierReactNativeDelegate
  self.courierDelegate = [[CourierReactNativeDelegate alloc] init];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

#pragma mark - Push Notification Registration

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // Forward to CourierReactNativeDelegate
  if ([self.courierDelegate respondsToSelector:@selector(application:didRegisterForRemoteNotificationsWithDeviceToken:)]) {
    [self.courierDelegate application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  }

  // And call super to keep Expo / React Native happy
  [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  // Forward to CourierReactNativeDelegate
  if ([self.courierDelegate respondsToSelector:@selector(application:didFailToRegisterForRemoteNotificationsWithError:)]) {
    [self.courierDelegate application:application didFailToRegisterForRemoteNotificationsWithError:error];
  }
}

#pragma mark - UNUserNotificationCenterDelegate

// Called when a notification is delivered while the app is foregrounded
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  // Forward to CourierReactNativeDelegate
  if ([self.courierDelegate respondsToSelector:@selector(userNotificationCenter:willPresentNotification:withCompletionHandler:)]) {
    [self.courierDelegate userNotificationCenter:center
                        willPresentNotification:notification
                          withCompletionHandler:completionHandler];
  } else {
    // If the Courier delegate doesn't handle it, provide a default
    completionHandler(UNNotificationPresentationOptionNone);
  }
}

// Called when the user taps on a notification
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  // Forward to CourierReactNativeDelegate
  if ([self.courierDelegate respondsToSelector:@selector(userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:)]) {
    [self.courierDelegate userNotificationCenter:center
                 didReceiveNotificationResponse:response
                          withCompletionHandler:completionHandler];
  } else {
    completionHandler();
  }
}

..

@end
```

# Android

You must extend your `MainActivity` with `CourierReactNativeActivity`

Kotlin
```kotlin
import com.courierreactnative.CourierReactNativeActivity;

class MainActivity : CourierReactNativeActivity() {
    ..
}
```

## Inbox

Because Courier Inbox uses Android's Material theme and your app's styles as the default colors, you need to make sure your `styles.xml` theme parent extends `MaterialComponents`.

In your `res/values/styles.xml` set the follow:

```xml
<resources>

  <!-- TODO: Must use Theme.MaterialComponents if you are using prebuilt UI -->

  <!-- Base application theme. -->
  <style name="AppTheme" parent="Theme.MaterialComponents.DayNight.NoActionBar">

  <!-- TODO: Customize the theme here. This will set the default values of your Courier Inbox -->

  <!-- <item name="colorPrimary">@android:color/holo_purple</item>-->
  <!-- <item name="colorPrimaryVariant">@android:color/holo_green_light</item>-->
  <!-- <item name="colorOnPrimary">@android:color/white</item>-->

  </style>

</resources>

```