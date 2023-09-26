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
            <th width="700px" align="left">Reason</th>
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
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-ios/blob/master/Docs/Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Needs Authentication to sync push notification device tokens to the current user and Courier.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

https://user-images.githubusercontent.com/6370613/199279392-1b376929-4a03-4acd-9d00-d170085d9791.mov

https://user-images.githubusercontent.com/6370613/199335432-aa52028a-f7ae-48bb-abec-427795baa6f4.mov
