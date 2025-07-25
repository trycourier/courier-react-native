<img width="1040" alt="banner-react-native" src="https://github.com/user-attachments/assets/c38f52d8-792f-4b51-a423-f1c5dd9f996b">

&emsp;

# Requirements & Support

<table>
    <thead>
        <tr>
            <th width="920px" align="left">Requirements</th>
            <th width="120px" align="center"></th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">Courier Account</td>
            <td align="center">
                <a href="https://app.courier.com/channels/courier">
                    <code>Sign Up</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">Minimum iOS SDK Version</td>
            <td align="center">
                <code>15.0</code>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">Minimum Android SDK Version</td>
            <td align="center">
                <code>23</code>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

# Installation

## Using `npm`

```sh
npm install @trycourier/courier-react-native
```

## Using `yarn`

```sh
yarn add @trycourier/courier-react-native
```

&emsp;

## iOS

### 1. Support iOS 15.0+ in your Project
   
<img width="470" alt="Screenshot 2025-01-21 at 12 55 34 PM" src="https://github.com/user-attachments/assets/ee7722b2-ce6a-4dc4-8b30-94f42494d80a" />

### 2. Support iOS 15+ in your Podfile

```sh
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p'..

# Courier React Native requires iOS 15+
platform :ios, '15.0' // Add this line
prepare_react_native_project!

..
```

### 3. Install the Cocoapods

From the root of your React Native project run

```sh
cd ios && pod install
```

&emsp;

## Android

### 1. Add the Jitpack repository

In your `android/build.gradle` make sure your build and repository values are as follows

```gradle
buildscript {

    ext {

        // Double check these values
        buildToolsVersion = "33.0.0"
        minSdkVersion = 23
        compileSdkVersion = 33
        targetSdkVersion = 33
        ..
    }

    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' } // THIS LINE
    }

    ..

}
```

### 2. Run Gradle Sync

Your app must support at least gradle `8.4`

&emsp;

### 3. Extend your `MainActivity` with `CourierReactNativeActivity`

This allows the Courier SDK to manage the current user between app sessions.

Java
```java
import com.courierreactnative.CourierReactNativeActivity;

public class MainActivity extends CourierReactNativeActivity {
    ..
}
```

Kotlin
```kotlin
import com.courierreactnative.CourierReactNativeActivity;

class MainActivity : CourierReactNativeActivity() {
    ..
}
```

&emsp;

# Getting Started

These are all the available features of the SDK.

<table>
    <thead>
        <tr>
            <th width="25px"></th>
            <th width="250px" align="left">Feature</th>
            <th width="725px" align="left">Description</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="center">
                1
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/1_Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Manages user credentials between app sessions. Required if you would like to use <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/2_Inbox.md"><code>Courier Inbox</code></a> and <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/3_PushNotifications.md"><code>Push Notifications</code></a>.
            </td>
        </tr>
        <tr width="600px">
            <td align="center">
                2
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/2_Inbox.md">
                    <code>Inbox</code>
                </a>
            </td>
            <td align="left">
                An in-app notification center you can use to notify your users. Comes with a prebuilt UI and also supports fully custom UIs.
            </td>
        </tr>
        <tr width="600px">
            <td align="center">
                3
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/3_PushNotifications.md">
                    <code>Push Notifications</code>
                </a>
            </td>
            <td align="left">
                Automatically manages push notification device tokens and gives convenient functions for handling push notification receiving and clicking.
            </td>
        </tr>
        <tr width="600px">
            <td align="center">
                4
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/4_Preferences.md">
                    <code>Preferences</code>
                </a>
            </td>
            <td align="left">
                Allow users to update which types of notifications they would like to receive.
            </td>
        </tr>
        <tr width="600px">
            <td align="center">
                5
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/5_Client.md">
                    <code>CourierClient</code>
                </a>
            </td>
            <td align="left">
                The base level API wrapper around the Courier endpoints. Useful if you have a highly customized user experience or codebase requirements.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

# Expo

If you are using Expo, you should check out the [Expo Docs](https://github.com/trycourier/courier-react-native/blob/master/Docs/6_Expo.md) for all the details.

&emsp;

# Example Projects

Starter projects using this SDK.

<table>
    <thead>
        <tr>
            <th width="1000px" align="left">Project Link</th>
        </tr>
    </thead>
    <tbody>
        <tr width="1000px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/tree/master/example">
                    <code>Example</code>
                </a>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

# **Share feedback with Courier**

We want to make this the best SDK for managing notifications! Have an idea or feedback about our SDKs? Let us know!

[Courier React Native Issues](https://github.com/trycourier/courier-react-native/issues)
