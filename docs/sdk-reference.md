<!-- Generated from https://www.courier.com/docs/sdk-libraries/react-native by mintlify-docs. Edit the docs source, not this file. -->

# Courier React Native SDK

> Prebuilt inbox and preferences UI, push token sync, and TypeScript APIs for React Native, with iOS and Android setup, Expo, and per-platform themes.

Source: https://www.courier.com/docs/sdk-libraries/react-native

The Courier React Native SDK gives you prebuilt components and TypeScript APIs. It handles authentication, token management, and real-time delivery on iOS and Android.

This page is the React Native reference: what to install, how to configure both native projects, and the TypeScript API surface. Each flow is written once and applies to every platform.

| To do this | Read |
| :-- | :-- |
| Render the inbox | [Add an inbox](https://www.courier.com/docs/in-app/add-an-inbox?lang=React%20Native) |
| Theme it, handle taps, or build your own UI | [Customize the inbox](https://www.courier.com/docs/in-app/customize-the-inbox?lang=React%20Native) |
| Set up push, from provider to device | [Set up push notifications](https://www.courier.com/docs/guides/set-up-mobile-push) |
| Add the preference center | [Add a preference center](https://www.courier.com/docs/in-app/add-a-preference-center?lang=React%20Native) |
| Mint the JWT you sign in with | [Authenticate users](https://www.courier.com/docs/in-app/authenticate-users?lang=React%20Native) |

Available on
[GitHub](https://github.com/trycourier/courier-react-native)
and [npm](https://www.npmjs.com/package/@trycourier/courier-react-native).

| Requirement | Value |
|-------------|-------|
| React Native | 0.73 or later. Tested on 0.85, 0.88 and 0.89. |
| Min iOS version | 15.0 |
| Xcode | 26 or later |
| Min Android SDK | 23 |
| Compile SDK | 34 or later. The SDK is built and tested against API 36, and your app can target 36. |
| Java | 11 or later |
| Kotlin | 1.8 or later |
| Gradle | 8.4+ |

## Installation

**npm**

```bash
npm install @trycourier/courier-react-native
```

**yarn**

```bash
yarn add @trycourier/courier-react-native
```

### iOS setup

#### Install the pods

```bash
cd ios && pod install
```

In React Native's Swift Package Manager mode (0.87 and later), skip this step. `npx react-native spm` picks up the package instead.

#### Forward the APNs callbacks

In your Swift `AppDelegate`, hold a `CourierDelegate` and forward the registration callbacks to it. This is what syncs the token. `CourierDelegate` isn't part of the package. Copy [`CourierDelegate.swift`](https://github.com/trycourier/courier-react-native/blob/main/example-085/ios/CourierReactNativeExample/CourierDelegate.swift) from the example app into your iOS project.

```swift
private let courierDelegate = CourierDelegate()

func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    courierDelegate.application(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken)
}

func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    courierDelegate.application(application, didFailToRegisterForRemoteNotificationsWithError: error)
}
```

Keep these callbacks in `AppDelegate` even if your app starts React Native from a `SceneDelegate`, as the React Native 0.88 template does. APNs delivers the token to the application, not to a scene. The iOS 27 SDK requires the scene life cycle, and the [example app's `SceneDelegate`](https://github.com/trycourier/courier-react-native/blob/main/example-085/ios/CourierReactNativeExample/SceneDelegate.swift) shows the split.

An older app with an Objective-C `AppDelegate` inherits from `CourierReactNativeDelegate` instead. On Expo, see [Expo](https://www.courier.com/docs/sdk-libraries/react-native#expo) below.

```objective-c
#import <courier-react-native/CourierReactNativeDelegate.h>

@interface AppDelegate : CourierReactNativeDelegate
@end
```

If your Podfile uses `use_frameworks!`, import it by module name instead: `#import <courier_react_native/CourierReactNativeDelegate.h>`.

### Android setup

#### Add the Jitpack repository

In your `android/build.gradle`:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
```

#### Set minimum SDK version

In your `android/build.gradle`:

```gradle
ext {
    minSdkVersion = 23
    compileSdkVersion = 36
    targetSdkVersion = 36
}
```

#### Extend CourierReactNativeActivity

Update your `MainActivity` to extend `CourierReactNativeActivity`. This lets the SDK manage user state across app sessions.

**Kotlin**

```kotlin
import com.courierreactnative.CourierReactNativeActivity

class MainActivity : CourierReactNativeActivity() {
    // ...
}
```

**Java**

```java
import com.courierreactnative.CourierReactNativeActivity;

public class MainActivity extends CourierReactNativeActivity {
    // ...
}
```

#### Use a Material theme

The prebuilt inbox and preference center only render correctly when your app theme extends `Theme.MaterialComponents`. Set it in `res/values/styles.xml`.

## Authentication

Courier authenticates with a **JWT** that your backend mints with your Courier API key, never in client code. [Authenticate users](https://www.courier.com/docs/in-app/authenticate-users?lang=React%20Native) covers the token flow, scope strings, reading auth state, signing out, and token refresh. Using the EU datacenter? See [EU setup](https://www.courier.com/docs/in-app/authenticate-users?lang=React%20Native#connect-to-the-eu-datacenter).

Credentials persist across app sessions, so you sign in once per user rather than on every launch.

```typescript
import Courier from "@trycourier/courier-react-native";

await Courier.shared.signIn({ userId: "your_user_id", accessToken: jwt });
await Courier.shared.signOut();
```

## Inbox

[Add an inbox](https://www.courier.com/docs/in-app/add-an-inbox?lang=React%20Native) is the setup flow. These are the types it uses on React Native.

| Type | What it is |
| :-- | :-- |
| `CourierInboxView` | The prebuilt inbox component |
| `theme` | `{ light, dark }`, a `CourierInboxTheme` for each system appearance |
| `addInboxListener` | Raw message data and events, for a UI you render yourself |

Every callback and action these expose is documented per platform in [Data and actions](https://www.courier.com/docs/in-app/build-a-custom-inbox?lang=React%20Native#data-and-actions).

### Inbox theme

The `theme` prop takes a `CourierInboxTheme` for light mode and one for dark mode. The inbox picks the one that matches the system appearance. Most fields apply on both platforms. Only a few platform-specific options go under `iOS` and `android`. Leave out any field to keep its default.

```typescript
<CourierInboxView
  theme={{
    light: {
      unreadIndicatorStyle: { indicator: "dot", color: "#9747FF" },
      titleStyle: { unread: { family: "Avenir", size: 18, color: "#101828" } },
      iOS: { messageAnimationStyle: "right" },
      android: { dividerItemDecoration: "vertical" },
    },
    dark: {
      unreadIndicatorStyle: { indicator: "dot", color: "#9747FF" },
      titleStyle: { unread: { family: "Avenir", size: 18, color: "#FFFFFF" } },
    },
  }}
/>
```

Fonts resolve differently on each platform. On iOS `family` is a font name. On Android it's a path to a font in your assets.

#### Background colors

The inbox has three background colors, and each defaults to the system background.

| Field | What it colors |
| :-- | :-- |
| `backgroundColor` | The area behind the list, which shows when the list is shorter than the screen |
| `listItemBackgroundColor` | Each message row |
| `tabBackgroundColor` | The Notifications and Archived tabs |

Setting `backgroundColor` alone leaves the rows and tabs at their defaults. For a dark inbox, set all three, and set text colors that read on a dark background. Use the same theme for both modes to keep the inbox dark when the device is in light mode.

```typescript
const darkInbox: CourierInboxTheme = {
  backgroundColor: "#0C111D",
  listItemBackgroundColor: "#0C111D",
  tabBackgroundColor: "#0C111D",
  tabIndicatorColor: "#7F56D9",
  tabStyle: {
    selected: { font: { size: 16, color: "#FFFFFF" }, indicator: { color: "#7F56D9" } },
    unselected: { font: { size: 16, color: "#98A2B3" } },
  },
  titleStyle: { unread: { size: 16, color: "#FFFFFF" }, read: { size: 16, color: "#98A2B3" } },
  bodyStyle: { unread: { size: 14, color: "#D0D5DD" }, read: { size: 14, color: "#98A2B3" } },
  timeStyle: { unread: { size: 12, color: "#D0D5DD" }, read: { size: 12, color: "#98A2B3" } },
  unreadIndicatorStyle: { color: "#7F56D9" },
  loadingIndicatorColor: "#FFFFFF",
  infoViewStyle: { font: { size: 16, color: "#FFFFFF" } },
};

<CourierInboxView theme={{ light: darkInbox, dark: darkInbox }} />
```

Branding from [Courier Studio](https://app.courier.com/content/brands) also applies. The SDK reads your brand's primary color.

## Push notifications

[Set up push notifications](https://www.courier.com/docs/guides/set-up-mobile-push) is the setup flow, from connecting APNs and FCM to a device that receives push. It covers the native wiring above, `setTokenForProvider`, permission, and reading the payload on tap.

> **Note:** Push notifications require a physical device. Simulators and emulators don't reliably support push token registration or notification delivery.

| Feature | iOS | Android |
|---------|-----|---------|
| Automatic token management | Yes | Yes |
| Notification tracking | Yes | Yes |
| Permission requests | Yes | Yes |

Two things live only here. On Android, forward both `FirebaseMessagingService` callbacks to `Courier.Companion.onMessageReceived` and `Courier.Companion.onNewToken`. On iOS, add a [Notification Service Extension](https://www.courier.com/docs/sdk-libraries/ios#notification-service-extension) to track delivery while your app is closed.

### Expo

Expo manages `AppDelegate` (iOS) and `MainActivity` (Android) itself, so the subclassing above doesn't apply. The [Expo example app](https://github.com/trycourier/courier-react-native/tree/main/example-expo-55) (Expo SDK 58) shows the wiring:

- **iOS:** its [`AppDelegate`](https://github.com/trycourier/courier-react-native/blob/main/example-expo-55/ios/CourierExpoExample/AppDelegate.swift) extends `ExpoAppDelegate`, holds a [`CourierExpoDelegate`](https://github.com/trycourier/courier-react-native/blob/main/example-expo-55/ios/CourierExpoExample/CourierExpoDelegate.swift), and forwards the APNs token to it.
- **Android:** its [`ExampleService`](https://github.com/trycourier/courier-react-native/blob/main/example-expo-55/android/app/src/main/java/com/courierexpoexample/ExampleService.kt) forwards the `FirebaseMessagingService` callbacks, and the app depends on `com.google.firebase:firebase-messaging`.

## Preferences

[Add a preference center](https://www.courier.com/docs/in-app/add-a-preference-center?lang=React%20Native) is the setup flow. These are the types it uses on React Native.

| Type | What it is |
| :-- | :-- |
| `CourierPreferencesView` | The prebuilt preference center component |
| `mode` | `{ type: "topic" }` or `{ type: "channels", channels: [...] }` |
| `theme` | `{ light, dark }`, a `CourierPreferencesTheme` for each system appearance |

> **Info:** Topics and sections are configured in the [Preferences Editor](https://www.courier.com/docs/guides/build-a-preference-center#configure-the-topics). See [Preferences Overview](https://www.courier.com/docs/recipients/preferences/overview) for how preference enforcement works at send time.

### Preferences theme

The `theme` prop works like the inbox one: a `CourierPreferencesTheme` for `light` and for `dark`, with shared fields at the top level and platform-specific options under `iOS` and `android`. [Courier Studio branding](https://app.courier.com/content/brands) applies automatically when you supply a `brandId`.

```typescript
<CourierPreferencesView
  mode={{ type: "topic" }}
  theme={{
    light: {
      brandId: "YOUR_BRAND_ID",
      backgroundColor: "#FFFFFF",
      sectionTitleFont: { size: 20, color: "#101828" },
      topicTitleFont: { size: 16, color: "#101828" },
      topicSubtitleFont: { size: 14, color: "#667085" },
      iOS: { sheetCornerRadius: 20 },
      android: { topicDividerItemDecoration: "vertical" },
    },
    dark: {
      brandId: "YOUR_BRAND_ID",
      backgroundColor: "#0C111D",
      sectionTitleFont: { size: 20, color: "#FFFFFF" },
      topicTitleFont: { size: 16, color: "#FFFFFF" },
      topicSubtitleFont: { size: 14, color: "#98A2B3" },
    },
  }}
/>
```

## CourierClient

For advanced use cases, `CourierClient` is a low-level wrapper around the Courier API. Each client holds its own credentials, so you can spin up as many as you need.

### Initialization

```typescript
import { CourierClient, getCourierApiUrlsForRegion } from "@trycourier/courier-react-native";

const client = new CourierClient({
    jwt:          "...",          // Optional. Required for most authenticated calls
    userId:       "your_user_id",
    connectionId: "...",          // Optional. Used for the inbox websocket
    tenantId:     "...",          // Optional. Scopes the client to a tenant
    apiUrls:      getCourierApiUrlsForRegion("eu"), // Optional. Use for EU users
    showLogs:     true            // Optional. Defaults to your build configuration
});

const options = client.options;

// Tear the client down when you no longer need it
client.remove();
```

### Token management

```typescript
const device = {
    appId:        "APP_ID",
    adId:         "AD_ID",
    deviceId:     "DEVICE_ID",
    platform:     "ios",
    manufacturer: "Apple",
    model:        "iPhone 15"
};

await client.tokens.putUserToken({
    token: "...",
    provider: "firebase-fcm",
    device // Optional
});

await client.tokens.deleteUserToken({ token: "..." });
```

### Inbox

```typescript
const messages = await client.inbox.getMessages({
    paginationLimit: 25,
    startCursor: undefined
});

const archived = await client.inbox.getArchivedMessages({
    paginationLimit: 25,
    startCursor: undefined
});

const unreadCount = await client.inbox.getUnreadMessageCount();

await client.inbox.open({ messageId: "..." });
await client.inbox.read({ messageId: "..." });
await client.inbox.unread({ messageId: "..." });
await client.inbox.archive({ messageId: "..." });
await client.inbox.readAll();
```

### Preferences

```typescript
const prefs = await client.preferences.getUserPreferences({
    paginationCursor: undefined
});

const topic = await client.preferences.getUserPreferenceTopic({
    topicId: "..."
});

await client.preferences.putUserPreferenceTopic({
    topicId: "...",
    status: CourierUserPreferencesStatus.OptedIn,
    hasCustomRouting: true,
    customRouting: [CourierUserPreferencesChannel.Push]
});
```

### Branding

```typescript
const brand = await client.brands.getBrand({ brandId: "..." });
```

### URL tracking

Pass any tracking URL found inside a push notification payload or inbox message:

```typescript
// Available events: Clicked, Delivered, Opened, Read, Unread
await client.tracking.postTrackingUrl({
    url: "courier_tracking_url",
    event: CourierTrackingEvent.Delivered
});
```

See the full Courier API reference at [courier.com/docs/reference](https://www.courier.com/docs/reference/api-overview).
