# Courier React Native Overview

```ts
await Courier.setIsDebugging(true);

const userId = await Courier.userId;

await Courier.signIn({
  accessToken: 'asdf...',
  userId: 'example_user_id',
});

await Courier.signOut();

await Courier.iOSForegroundPresentationOptions({
  options: ['badge', 'banner', 'list', 'sound'],
});

const currentPermissionStatus = await Courier.notificationPermissionStatus;
const requestNotificationPermission = await Courier.requestNotificationPermission();

await Courier.setFcmToken('asdf...');

const fcmToken = await Courier.fcmToken;
const apnsToken = await Courier.apnsToken;

const unsubscribe = Courier.registerPushNotificationListeners({
  onPushNotificationClicked(push) {
    console.log(push);
  },
  onPushNotificationDelivered(push) {
    console.log(push);
  },
});

const messageId = await Courier.sendPush({
  authKey: 'asdf...',
  userId: 'example_user_id',
  title: 'Hey! 👋',
  body: 'Courier is awesome!!',
  isProduction: false,
  providers: [CourierProvider.APNS, CourierProvider.FCM],
});
```

# Requirements & Support

| Operating System | Minimum SDK | Compile Target SDK |
| :--------------- | ----------: | -----------------: |
| `iOS`            |        `13` |                  — |
| `Android`        |        `21` |               `32` |

| Push Provider                            | Supported Platforms |
| :--------------------------------------- | ------------------: |
| `APNS (Apple Push Notification Service)` |               `iOS` |
| `FCM (Firebase Cloud Messaging)`         |           `Android` |

> Most of this SDK depends on a Courier account: [`Create a Courier account here`](https://app.courier.com/signup)

> Testing push notifications requires a physical device. Simulators will not work.

# **Installation**

> Link to [`Example App`](https://github.com/trycourier/courier-react-native/tree/master/example)

1. [`Install the package`](#1-install-the-package)
2. [`iOS Setup`](#2-ios-setup)
3. [`Android Setup`](#3-android-setup)
4. [`Configure Push Provider`](#4-configure-push-provider)
5. [`Managing User State`](#5-managing-user-state)
6. [`Going to Production`](#going-to-production)

&emsp;

## **1. Install the package**

Run the following command at your project's root directory:

using npm:

```
npm install @trycourier/courier-react-native
```

using yarn:

```
yarn add @trycourier/courier-react-native
```

&emsp;

## **2. iOS Setup**

> If you don't need push notification support on iOS, you can skip this step.

https://user-images.githubusercontent.com/6370613/198094477-40f22b1e-b3ad-4029-9120-0eee22de02e0.mov

1. From your project's root directory, run: `cd ios && pod update`
2. Open your iOS project and increase the min SDK target to iOS 13.0+
3. Change your `AppDelegate` to extend the `CourierReactNativeDelegate`
   - This automatically syncs APNS tokens to Courier
   - Allows the React Native SDK to handle when push notifications are delivered and clicked
4. Enable the "Push Notifications" capability

### **Add the Notification Service Extension (Recommended)**

To make sure Courier can track when a notification is delivered to the device, you need to add a Notification Service Extension. Here is how to add one.

https://user-images.githubusercontent.com/6370613/198336479-45aeec9e-0c94-4c29-b132-ea8c777b9da1.mov

1. Download and Unzip the Courier Notification Service Extension: [`CourierNotificationServiceTemplate.zip`](https://github.com/trycourier/courier-notification-service-extension-template/archive/refs/heads/main.zip)
2. Open the folder in terminal and run `sh make_template.sh`
   - This will create the Notification Service Extension on your mac to save you time
3. Open your iOS app in Xcode and go to File > New > Target
4. Select "Courier Service" and click "Next"
5. Give the Notification Service Extension a name (i.e. "CourierService"), select `Courier_iOS` as the Package, and click "Finish"
6. Click "Cancel" on the next popup
   - You do NOT need to click "Activate" here. Your Notification Service Extension will still work just fine.
7. Open your `Podfile` and add the following snippet to the end of your Podfile
   - This will link the `Courier-iOS` pod to your Notification Service Extension

```
target 'CourierService' do
  pod 'Courier-iOS'
end
```

1. From the root of your React Native app, run: `cd ios && pod install`

&emsp;

## **3. Android Setup**

> If you don't need push notification support on Android, you can skip this step.

https://user-images.githubusercontent.com/6370613/198111372-09a29aba-6507-4cf7-a59d-87e8df2ba492.mov

1. Open Android project
2. Make sure your `yourApp/android/build.gradle` file support Jitpack:

```groovy
allprojects {
    repositories {
        ..
        maven { url 'https://www.jitpack.io' } // This line is needed
    }
}
```

3. Update your `yourApp/android/build.gradle` to support the following SDK versions
    - This is needed to support newer Android Notification APIs

```groovy
buildscript {
    ext {
        buildToolsVersion = "32.0.0"
        minSdkVersion = 21
        compileSdkVersion = 32
        targetSdkVersion = 32
        ..
    }
    ..
}
```

4. Add the `google-services` dependency to your `yourApp/android/build.gradle` file:

```groovy
buildscript {
  dependencies {
    ..
    classpath("com.google.gms:google-services:4.3.14") // Add this line
  }
}
```

5. Add this following line to the top of your `/android/app/build.gradle` file:

```groovy
apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services" // Add this line
```

6. Run Gradle Sync
7. Change your `MainActivity` to extend the `CourierReactNativeActivity`
   - This allows Courier to handle when push notifications are delivered and clicked
8. Setup a new Notification Service by creating a new file and pasting the code below in it
   - This allows you to present a notification to your user when a new notification arrives

```java
import androidx.annotation.NonNull;

import com.courier.android.notifications.RemoteMessageExtensionsKt;
import com.courier.android.service.CourierService;
import com.google.firebase.messaging.RemoteMessage;

// This is safe. `CourierService` will automatically handle token refreshes.
@SuppressLint("MissingFirebaseInstanceTokenRefresh")
public class YourNotificationService extends CourierService {
  @Override
  public void showNotification(@NonNull RemoteMessage message) {
    super.showNotification(message);

    // TODO: This is where you will customize the notification that is shown to your users
    // The function below is used to get started quickly.
    // You likely do not want to use `message.presentNotification(...)`
    // For React Native, you likely do not want to change RemoteMessageExtensionsKt.presentNotification.handlingClass
    // More information on how to customize an Android notification here:
    // https://developer.android.com/develop/ui/views/notifications/build-notification

    RemoteMessageExtensionsKt.presentNotification(
      message,
      this,
      MainActivity.class,
      android.R.drawable.ic_dialog_info,
      "Notification Service"
    );
    
  }
}
```

7. Add the Notification Service entry in your `AndroidManifest.xml` file

```xml
<manifest>
    <application>

        <activity>
            ..
        </activity>

        // Add this 👇
        <service
            android:name=".YourNotificationService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
        // Add this 👆

        ..

    </application>
</manifest>
```

&emsp;

## **4. Configure Push Provider**

> If you don't need push notification support, you can skip this step.

To get push notification to appear in your app, add support for the provider you would like to use:

- [`APNS (Apple Push Notification Service)`](https://www.courier.com/docs/guides/providers/push/apple-push-notification)
- [`FCM (Firebase Cloud Messaging)`](https://www.courier.com/docs/guides/providers/push/firebase-fcm/)

&emsp;

## **5. Managing User State**

Best user experience practice is to synchronize the current user's push notification tokens and the user's state. Courier does most of this for you automatically!

> You can use a Courier Auth Key [`found here`](https://app.courier.com/settings/api-keys) when developing.

> When you are ready for production release, you should be using a JWT as the `accessToken`.
> Here is more info about [`Going to Production`](#going-to-production)

Place these functions where you normally manage your user's state:

```dart
// Saves accessToken and userId to native level local storage
// This will persist between app sessions
await Courier.shared.signIn(
    accessToken: accessToken,
    userId: userId,
);

await Courier.shared.signOut();
```

If you followed the steps above:

- APNS tokens on iOS will automatically be synced to Courier
- FCM tokens on Android will automatically be synced to Courier

<!-- If you want FCM tokens to sync to Courier on iOS:

1. Add the following react native packages to your project
   - [`React Native Firebase`](https://rnfirebase.io/)

2. Add code to manually sync FCM tokens

```typescript
const fcmToken = await FirebaseMessaging.instance.getToken();
if (fcmToken != null) {
    await Courier.shared.setFcmToken(token: fcmToken);
}

// Handle FCM token refreshes
FirebaseMessaging.instance.onTokenRefresh.listen((fcmToken) {
    Courier.shared.setFcmToken(token: fcmToken);
});
``` -->

&emsp;

## **6. Testing Push Notifications**

> If you don't need push notification support, you can skip this step.

Courier allows you to send a push notification directly from the SDK to a user id. No tokens juggling or backend needed!

```typescript
const notificationPermission = await Courier.notificationPermissionStatus;;
print(notificationPermission);

// Notification permissions must be `authorized` on iOS to receive pushes

const requestedNotificationPermission = await Courier.requestNotificationPermission();
print(requestedNotificationPermission);

// This is how iOS will show the notification when the app is in the foreground
// Passing [] will not present anything
// `Courier.shared.onPushNotificationDelivered` will still get called
await Courier.iOSForegroundPresentationOptions({
  options: ['badge', 'banner', 'list', 'sound'],
});


// the function returns an unsubscribe function
// call the function to stop listening to notifications
// Recommended to call the function while component mounts and unsubscribe when the component unmounts
const unsubscribe = Courier.registerPushNotificationListeners({

  // Will be called if the app is in the foreground and a push notification arrives
  onPushNotificationClicked(push) {
    ...
  },

  // Will be called when a user clicks a push notification
  onPushNotificationDelivered(push) {
    ...
  },
});

// Sends a test push
const messageId = await Courier.shared.sendPush(
    authKey: 'a_courier_auth_key_that_should_only_be_used_for_testing',
    userId: 'example_user',
    title: 'Chirp Chrip!',
    body: 'Hello from Courier 🐣',
    isProduction: false, // This only affects APNS pushes. false == sandbox / true == production
    providers: [CourierProvider.APNS, CourierProvider.FCM],
);
```

&emsp;

## **Going to Production**

For security reasons, you should not keep your `authKey` (which looks like: `pk_prod_ABCD...`) in your production app. The `authKey` is safe to test with, but you will want to use an `accessToken` in production.

To create an `accessToken`, call this:

```curl
curl --request POST \
     --url https://api.courier.com/auth/issue-token \
     --header 'Accept: application/json' \
     --header 'Authorization: Bearer $YOUR_AUTH_KEY' \
     --header 'Content-Type: application/json' \
     --data
 '{
    "scope": "user_id:$YOUR_USER_ID write:user-tokens",
    "expires_in": "$YOUR_NUMBER days"
  }'
```

Or generate one here:
[`Issue Courier Access Token`](https://www.courier.com/docs/reference/auth/issue-token/)

> This request to issue a token should likely exist in a separate endpoint served on your backend.

&emsp;

## **Share feedback with Courier**

We want to make this the best SDK for managing notifications! Have an idea or feedback about our SDKs? Here are some links to contact us:

- [Courier Feedback](https://feedback.courier.com/)
- [Courier React native Issues](https://github.com/trycourier/courier-react-native/issues)
