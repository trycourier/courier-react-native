<img width="1040" alt="banner-react-native" src="https://github.com/trycourier/courier-react-native/assets/6370613/2970316d-fdb2-4491-8578-cf4aec1bcfe6">

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
                <code>13.0</code>
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

### 1. Support iOS 13.0+ in your Project
   
<img width="737" alt="Screenshot 2023-09-26 at 2 16 51 PM" src="https://github.com/trycourier/courier-react-native/assets/6370613/6bf98576-9b26-4b5e-8add-7289531e6431">

### 2. Support iOS 13+ in your Podfile

```sh
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p'..

# Courier React Native requires iOS 13+
platform :ios, '13.0' // Add this line
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

&emsp;

### 3. Extend the `CourierReactNativeActivity`

In your Android project, change your `MainActivity` to extend the `CourierReactNativeActivity`.

This allows the Courier SDK to manage the current user between app sessions.

```java
import com.courierreactnative.CourierReactNativeActivity;

public class MainActivity extends CourierReactNativeActivity {
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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Manages user credentials between app sessions. Required if you would like to use <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md"><code>Courier Inbox</code></a> and <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/PushNotifications.md"><code>Push Notifications</code></a>.
            </td>
        </tr>
        <tr width="600px">
            <td align="center">
                2
            </td>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md">
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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/PushNotifications.md">
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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Preferences.md">
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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Client.md">
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

We are building the best SDKs for handling notifications! Have an idea or feedback about our SDKs? Here are some links to contact us:

- [Courier Feedback](https://feedback.courier.com/)
- [Courier React Native Issues](https://github.com/trycourier/courier-react-native/issues)
