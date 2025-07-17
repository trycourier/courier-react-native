# Expo

This is how to using `CourierReactNative` in an Expo app.

&emsp;

# iOS

## Push Notifications

If you want to automatically sync [`Push Notification`](https://github.com/trycourier/courier-react-native/blob/master/Docs/3_PushNotifications.md) tokens you will need to update your `AppDelegate` files.

<details>

<summary>Swift</summary>

### 1. Add this file to your iOS Project

```swift
import UIKit
import UserNotifications
import Courier_iOS
import React

@objc class CourierExpoDelegate: NSObject, UNUserNotificationCenterDelegate {

  private var notificationPresentationOptions: UNNotificationPresentationOptions = []
  private var cachedMessage: [AnyHashable: Any]?
  private var isReactNativeReady = false

  private let courierForegroundOptionsDidChangeNotification = Notification.Name("iosForegroundNotificationPresentationOptions")

  override init() {
    super.init()

    // Set the user agent
    Courier.agent = CourierAgent.reactNativeExpoIOS("5.6.7")

    // Register for remote notifications
    UIApplication.shared.registerForRemoteNotifications()

    // Set notification center delegate
    UNUserNotificationCenter.current().delegate = self

    // Observe notifications
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(notificationPresentationOptionsUpdate(_:)),
      name: courierForegroundOptionsDidChangeNotification,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onBridgeWillReload),
      name: NSNotification.Name.RCTBridgeWillReload,
      object: nil
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(onReactNativeReady(_:)),
      name: NSNotification.Name.RCTContentDidAppear,
      object: nil
    )
  }

  // MARK: - React Native lifecycle

  /// Called when React Native is loaded and ready
  @objc private func onReactNativeReady(_ note: Notification) {
    isReactNativeReady = true

    // Flush any cached message
    if let message = cachedMessage {
      NotificationCenter.default.post(
        name: Notification.Name("pushNotificationClicked"),
        object: nil,
        userInfo: message
      )
      cachedMessage = nil
    }
  }

  /// Called when there is a reload in React Native
  @objc private func onBridgeWillReload() {
    isReactNativeReady = false
  }

  // MARK: - Foreground options update

  @objc private func notificationPresentationOptionsUpdate(_ notification: Notification) {
    if let userInfo = notification.userInfo,
       let options = userInfo["options"] as? NSNumber {
      notificationPresentationOptions = UNNotificationPresentationOptions(rawValue: options.uintValue)
    }
  }

  // MARK: - UNUserNotificationCenterDelegate

  /// User tapped on a notification
  func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    let content = response.notification.request.content
    let message = content.userInfo

    // Track click event
    Task {
      await message.trackMessage(event: .clicked)
    }

    let pushNotification = Courier.formatPushNotification(content: content)

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      if self.isReactNativeReady {
        NotificationCenter.default.post(
          name: Notification.Name("pushNotificationClicked"),
          object: nil,
          userInfo: pushNotification
        )
      } else {
        self.cachedMessage = pushNotification
      }
      completionHandler()
    }
  }

  /// Notification delivered while app is in foreground
  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    let content = notification.request.content
    let message = content.userInfo

    // Track delivery event
    Task {
      await message.trackMessage(event: .delivered)
    }

    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      let pushNotification = Courier.formatPushNotification(content: content)
      NotificationCenter.default.post(
        name: Notification.Name("pushNotificationDelivered"),
        object: nil,
        userInfo: pushNotification
      )
      completionHandler(self.notificationPresentationOptions)
    }
  }

  // MARK: - Push Registration

  @objc func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("[Courier] Failed to register for remote notifications: \(error.localizedDescription)")
  }

  @objc func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    Task { @CourierActor in
      Courier.setAPNSToken(deviceToken)
    }
  }

  deinit {
    cachedMessage = nil
    isReactNativeReady = false
    NotificationCenter.default.removeObserver(self)
  }
}
```

### 2. Update your `AppDelegate.swift` to add these lines

```swift
@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  
  ..
  
  // == ADD THIS LINE ==
  private let courierExpoDelegate = CourierExpoDelegate()

  ..
  
  // == ADD THIS LINE ==
  public override func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    courierExpoDelegate.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
  }
  
}
```

</details>

<details>

<summary>Objective C</summary>

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

</details>

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
