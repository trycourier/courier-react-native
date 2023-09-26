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
              ❌
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
                <a href="https://github.com/trycourier/courier-react-native/blob/feature/courier-inbox/Docs/Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Needs Authentication to sync push notification device tokens to the current user and Courier.
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-ios/blob/master/Docs/PushNotifications.md#1-setup-a-push-notification-provider">
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
                <code>Not Supported</code>
            </td>
            <td align="center">
                <code>Not Supported</code>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://app.courier.com/channels/expo">
                    <code>Expo</code>
                </a>
            </td>
            <td align="center">
                <code>Not Supported</code>
            </td>
            <td align="center">
                <code>Not Supported</code>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

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

1. Open your iOS project and increase the min SDK target to iOS 13.0+
2. Open your `Podfile` and increase the platform:

```
..
platform :ios, '13'
..
```

3. From your React Native project's root directory, run: `cd ios && pod update`
4. In Xcode, change your `AppDelegate.h` to use the snippet below:
   - This automatically syncs APNS tokens to Courier token management
   - Allows the React Native SDK to handle when push notifications are delivered and clicked

```objective-c
#import <courier-react-native/CourierReactNativeDelegate.h>

@interface AppDelegate : CourierReactNativeDelegate
@end
```

## 3. Add the Notification Service Extension (Optional, but recommended)

To make sure Courier can track when a notification is delivered to the device, you need to add a Notification Service Extension. Here is how to add one.

https://user-images.githubusercontent.com/29832989/202580269-863a9293-4c0b-48c9-8485-c0c43f077e12.mov

1. Download and Unzip the Courier Notification Service Extension: [`CourierNotificationServiceTemplate.zip`](https://github.com/trycourier/courier-notification-service-extension-template/archive/refs/heads/main.zip)
2. Open the folder in terminal and run `sh make_template.sh`
    - This will create the Notification Service Extension on your mac to save you time
3. Open your iOS app in Xcode and go to File > New > Target
4. Select "Courier Service" and click "Next"
5. Give the Notification Service Extension a name (i.e. "CourierService").
6. Click Finish

### Link the Courier SDK to your extension:

#### Swift Package Manager Setup
1. Click on your project file
2. Under Targets, click on your new Target
3. Under the General tab > Frameworks and Libraries, click the "+" icon
4. Select the Courier package from the list under Courier Package > Courier

#### Cocoapods Setup
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
4. Make sure your `yourApp/android/build.gradle` file supports Jitpack:

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

# Authenticate and Test

1. Register for push notifications

### React Hooks

```javascript
import { CourierProvider } from '@trycourier/courier-react-native';

// Add the CourierProvider as the parent to your component
<CourierProvider>
   ...
</CourierProvider>

// Add the following to your component
import { useCourierAuth, useCourierPush } from '@trycourier/courier-react-native';

const auth = useCourierAuth();

const push = useCourierPush({
  iOSForegroundPresentationOptions: ['sound', 'badge', 'list', 'banner']
});

useEffect(() => {

  const signIn = async () => {

    // Sign the user in
    // This registers the SDK to authenticate a user
    await auth.signIn({
      accessToken: "your_access_token",
      userId: "your_user_id",
    });

    // Request push permissions
    // This will sync the tokens to Courier
    const status = await push.requestNotificationPermission();

  }

  signIn();

}, []);

// Push Notification Permission Status
useEffect(() => {
  console.log('Notification Permissions');
  console.log(push.notificationPermissionStatus);
}, [push.notificationPermissionStatus]);

// Available Push Tokens
useEffect(() => {
  console.log('Push Tokens');
  console.log(push.tokens);
}, [push.tokens]);

// Push is delivered
useEffect(() => {
  if (push.delivered) {
    console.log(push.delivered);
    Alert.alert('📬 Push Notification Delivered', JSON.stringify(push.delivered));
  }
}, [push.delivered]);

// Push is clicked
useEffect(() => {
  if (push.clicked) {
    console.log(push.clicked);
    Alert.alert('👆 Push Notification Clicked', JSON.stringify(push.clicked));
  }
}, [push.clicked]);
```

### Vanilla Javascript

```javascript
import Courier from '@trycourier/courier-react-native';

useEffect(() => {

  // Handle sign in
  const signIn = async () => {

    await Courier.shared.signIn({
      accessToken: 'asdf',
      userId: 'asdf'
    });

    const status = await Courier.shared.requestNotificationPermission();

  }

  signIn();

  // Handle pushes
  const pushListener = Courier.shared.addPushNotificationListener({
    onPushNotificationDelivered: (push) => {
      console.log(push);
      Alert.alert('👆 Push Notification Delivery', JSON.stringify(push));
    },
    onPushNotificationClicked: (push) => {
      console.log(push);
      Alert.alert('👆 Push Notification Clicked', JSON.stringify(push));
    }
  });

  return () => {
    pushListener.remove();
  }

}, []);
```

2. Send a test message

```curl
curl --request POST \
  --url https://api.courier.com/send \
  --header 'Authorization: Bearer YOUR_AUTH_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
	"message": {
		"to": {
			"user_id": "your_user_id"
		},
		"content": {
			"title": "Hey there 👋",
			"body": "Have a great day 😄"
		},
		"routing": {
			"method": "all",
			"channels": [
				"apn", "firebase-fcm"
			]
		}
	}
}'
```
