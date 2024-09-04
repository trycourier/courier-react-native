<img width="1040" alt="banner-react-native-push" src="https://github.com/trycourier/courier-react-native/assets/6370613/67762338-2f2b-4b46-bf28-1462ca742fed">

&emsp;

# Push Notifications

The easiest way to support push notifications in your app.

## Features

<table>
    <thead>
        <tr>
            <th width="350px" align="left">Feature</th>
            <th width="600px" align="left">Description</th>
            <th width="100px" align="center">iOS</th>
            <th width="100px" align="center">Android</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <code>Automatic Token Management</code>
            </td>
            <td align="left">
                Push notification tokens automatically sync to the Courier studio.
            </td>
            <td align="center">
              ✅
            </td>
            <td align="center">
              ✅
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <code>Notification Tracking</code>
            </td>
            <td align="left">
                Track if your users received or clicked your notifications even if your app is not runnning or open.
            </td>
            <td align="center">
              ✅
            </td>
            <td align="center">
              ✅
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <code>Permission Requests & Checking</code>
            </td>
            <td align="left">
                Simple functions to request and check push notification permission settings.
            </td>
            <td align="center">
              ✅
            </td>
            <td align="center">
              ✅
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## Requirements

<table>
    <thead>
        <tr>
            <th width="300px" align="left">Requirement</th>
            <th width="750px" align="left">Reason</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Needs Authentication to sync push notification device tokens to the current user and Courier.
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/PushNotifications.md#1-setup-a-push-notification-provider">
                    <code>A Configured Provider</code>
                </a>
            </td>
            <td align="left">
                Courier needs to know who to route the push notifications to so your users can receive them.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

<table>
    <thead>
        <tr>
            <th width="700px" align="left">Provider</th>
            <th width="200px" align="center">iOS Token Sync</th>
            <th width="200px" align="center">Android Token Sync</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/apn">
                    <code>(APNS) - Apple Push Notification Service</code>
                </a>
            </td>
            <td align="center">
                <code>Automatic</code>
            </td>
            <td align="center">
                <code>Not Supported</code>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/firebase-fcm">
                    <code>(FCM) - Firebase Cloud Messaging</code>
                </a>
            </td>
            <td align="center">
                <code>Manual</code>
            </td>
            <td align="center">
                <code>Automatic</code>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/onesignal">
                    <code>OneSignal</code>
                </a>
            </td>
            <td align="center">
                <code>Manual</code>
            </td>
            <td align="center">
                <code>Manual</code>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/expo">
                    <code>Expo</code>
                </a>
            </td>
            <td align="center">
                <code>Manual</code>
            </td>
            <td align="center">
                <code>Manual</code>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

# Manual Token Syncing

To manually sync tokens, use the following code.

```javascript
// To set the token in the Courier
await Courier.shared.setToken({
  key: 'YOUR_PROVIDER',
  token: 'example_token'
});

// Or

await Courier.shared.setTokenForProvider({
  provider: CourierPushProvider.EXPO,
  token: 'example_token'
});

// To get the token stored in the SDK
// This does not get it from the Courier API, just from the SDK's local storage
const tokenForProvider = await Courier.shared.getTokenForProvider({
  provider: CourierPushProvider.EXPO
});

// Or

const tokenForKey = await Courier.shared.getToken({
  key: 'YOUR_PROVIDER'
});
```

&emsp;

# Automatic Token Syncing

To allow the Courier SDK to automatically sync tokens, use the following steps.

# iOS Setup 

<table>
    <thead>
        <tr>
            <th width="300px" align="left">Requirement</th>
            <th width="750px" align="left">Reason</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://developer.apple.com/account/">
                    <code>Apple Developer Membership</code>
                </a>
            </td>
            <td align="left">
                Apple requires all iOS developers to have a membership so you can manage your push notification certificates.
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                A phyical iOS device
            </td>
            <td align="left">
                Although you can setup the Courier SDK without a device, a physical device is the only way to fully ensure push notification tokens and notification delivery is working correctly. Simulators are not reliable.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## 1. Enable the "Push Notifications" capability 

https://user-images.githubusercontent.com/29832989/204891095-1b9ac4f4-8e5f-4c71-8e8f-bf77dc0a2bf3.mov
1. Select your Xcode project file
2. Click your project Target
3. Click "Signing & Capabilities"
4. Click the small "+" to add a capability
5. Press Enter

## 2. Support Notification Callbacks and Automatic APNS Token syncing

In Xcode, change your `AppDelegate.h` to use this snippet.

```objective-c
#import <courier-react-native/CourierReactNativeDelegate.h>

@interface AppDelegate : CourierReactNativeDelegate
@end
```

## 3. Add the Notification Service Extension (Optional, but recommended)

To make sure Courier can track when a notification is delivered to the device, you need to add a Notification Service Extension. Here is how to add one.

https://github.com/trycourier/courier-react-native/assets/6370613/c3dcd451-e24a-4a0f-8676-36239d817ddb

1. Download and Unzip the Courier Notification Service Extension: [`CourierNotificationServiceTemplate.zip`](https://github.com/trycourier/courier-notification-service-extension-template/archive/refs/heads/main.zip)
2. Open the folder in terminal and run `sh make_template.sh`
    - This will create the Notification Service Extension on your mac to save you time
3. Open your iOS app in Xcode and go to File > New > Target
4. Select "Courier Service" and click "Next"
5. Give the Notification Service Extension a name (i.e. "CourierService").
6. Click Finish
7. Go into your CourierService target > Build Settings > Search "ENABLE_USER"
8. Set "User Script Sandboxing" to "No"

### Link the Courier SDK to your extension:

1. Add the following snippet to the bottom of your Podfile

```ruby 
target 'CourierService' do
    pod 'Courier_iOS'
end
```

2. Run `pod install`

&emsp;

# Android Setup 

<table>
    <thead>
        <tr>
            <th width="300px" align="left">Requirement</th>
            <th width="750px" align="left">Reason</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://firebase.google.com/">
                    <code>Firebase Account</code>
                </a>
            </td>
            <td align="left">
                Needed to send push notifications out to your Android devices. Courier recommends you do this for the most ideal developer experience.
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                A phyical Android device
            </td>
            <td align="left">
                Although you can setup the Courier SDK without a physical device, a physical device is the best way to fully ensure push notification tokens and notification delivery is working correctly. Simulators are not reliable.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## 1. Add Firebase 

https://user-images.githubusercontent.com/6370613/199335432-aa52028a-f7ae-48bb-abec-427795baa6f4.mov

1. Open Android project
2. Register your app in Firebase and download your `google-services.json` file
3. Add the `google-services.json` file to your `yourApp/app/src` directory
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

## 2. Support Notification Callbacks and Automatic FCM Token syncing

https://user-images.githubusercontent.com/6370613/199335233-0880209b-5aec-4584-9726-eaa1077bf80d.mov

1. Change your `MainActivity` to extend the `CourierReactNativeActivity`
   - This allows Courier to handle when push notifications are delivered and clicked
2. Setup a new Notification Service by creating a new java file and paste the code below in it
   - This allows you to present a notification to your user when a new notification arrives and will automatically sync new fcm tokens to Courier token management

```java
// Your project import

import android.annotation.SuppressLint;
import androidx.annotation.NonNull;
import com.courier.android.notifications.RemoteMessageExtensionsKt;
import com.courier.android.service.CourierService;
import com.google.firebase.messaging.RemoteMessage;

// This is safe. `CourierService` will automatically handle token refreshes.
@SuppressLint("MissingFirebaseInstanceTokenRefresh")
public class YourExampleService extends CourierService {

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

3. Add the Notification Service entry in your `AndroidManifest.xml` file

```xml
<manifest>
    <application>

        <activity>
            ..
        </activity>

        // Add this 👇
        <service
            android:name=".YourExampleService"
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

## **Support Notifications**

```typescript
// Support the type of notifications you want to show on iOS
Courier.setIOSForegroundPresentationOptions({
  options: 'sound' | 'badge' | 'list' | 'banner'
});

// Request / Get Notification Permissions
final currentPermissionStatus = await Courier.getNotificationPermissionStatus();
final requestPermissionStatus = await Courier.requestNotificationPermission();

// Handle push events
const pushListener = Courier.shared.addPushListener(
  onPushClicked: (push) => {
    console.log(push);
  },
  onPushDelivered: (push) => {
    console.log(push);
  },
);

// Remove the listener where makes sense to you
pushListener.remove();

// Tokens
await Courier.shared.setToken({ key: "...", token: "..." });
await Courier.shared.getToken({ key: "..." });
const tokens = await Courier.shared.getAllTokens();
```

## **Send a Message**

<table>
    <thead>
        <tr>
            <th width="600px" align="left">Provider</th>
            <th width="200px" align="center">Link</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/apn">
                    <code>(APNS) - Apple Push Notification Service</code>
                </a>
            </td>
            <td align="center">
                <a href="https://www.courier.com/docs/platform/channels/push/apple-push-notification/#sending-messages">
                    <code>Testing Docs</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/firebase-fcm">
                    <code>(FCM) - Firebase Cloud Messaging</code>
                </a>
            </td>
            <td align="center">
                <a href="https://www.courier.com/docs/platform/channels/push/firebase-fcm/#sending-messages">
                    <code>Testing Docs</code>
                </a>
            </td>
        </tr>
    </tbody>
</table>

---

👋 `TokenManagement APIs` can be found <a href="https://github.com/trycourier/courier-flutter/blob/master/Docs/Client.md#token-management-apis"><code>here</code></a>
