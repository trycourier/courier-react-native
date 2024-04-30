<img width="1040" alt="banner-react-native-preferences" src="https://github.com/trycourier/courier-react-native/assets/6370613/56685f91-9fb7-4ec1-a8c7-b08302c9e7df">

# Courier Preferences

In-app notification settings that allow your users to customize which of your notifications they receive. Allows you to build high quality, flexible preference settings very quickly.

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
                Needed to view preferences that belong to a user.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## Default Preferences View

The default `CourierPreferencesView` styles.

<img width="150" alt="default-inbox-styles" src="https://github.com/trycourier/courier-ios/assets/6370613/483a72be-3869-43a2-ab48-a07a8c7b4cf2.gif">
<img width="150" alt="default-inbox-styles" src="https://github.com/trycourier/courier-android/assets/6370613/681a8de9-536a-40cb-93bf-8e51caae7f4b.gif">

```javascript
import Courier, { CourierPreferencesView } from '@trycourier/courier-react-native';

<CourierPreferencesView 
  mode={{ type: 'topic' }}
  style={...}
/>
```

&emsp;

## Styled Preferences View

The styles you can use to quickly customize the `CourierPreferences`.

<img width="150" alt="default-inbox-styles" src="https://github.com/trycourier/courier-ios/assets/6370613/4291c507-ffe4-41de-b551-596e5f33ff72.gif">
<img width="150" alt="default-inbox-styles" src="https://github.com/trycourier/courier-android/assets/6370613/67c6b772-f6e3-4937-b090-b0769d64d100.gif">

```swift
import Courier_iOS

let textColor = UIColor(red: 42 / 255, green: 21 / 255, blue: 55 / 255, alpha: 100)
let primaryColor = UIColor(red: 136 / 255, green: 45 / 255, blue: 185 / 255, alpha: 100)
let secondaryColor = UIColor(red: 234 / 255, green: 104 / 255, blue: 102 / 255, alpha: 100)

// Theme object containing all the styles you want to apply 
let preferencesTheme = CourierPreferencesTheme(
    brandId: "7S9R...3Q1M", // Optional. Theme colors will override this brand.
    loadingIndicatorColor: secondaryColor,
    sectionTitleFont: CourierStyles.Font(
        font: UIFont(name: "Avenir Black", size: 20)!,
        color: .white
    ),
    topicCellStyles: CourierStyles.Cell(
        separatorStyle: .none
    ),
    topicTitleFont: CourierStyles.Font(
        font: UIFont(name: "Avenir Medium", size: 18)!,
        color: .white
    ),
    topicSubtitleFont: CourierStyles.Font(
        font: UIFont(name: "Avenir Medium", size: 16)!,
        color: .white
    ),
    topicButton: CourierStyles.Button(
        font: CourierStyles.Font(
            font: UIFont(name: "Avenir Medium", size: 16)!,
            color: .white
        ),
        backgroundColor: secondaryColor,
        cornerRadius: 8
    ),
    sheetTitleFont: CourierStyles.Font(
        font: UIFont(name: "Avenir Medium", size: 18)!,
        color: .white
    ),
    sheetSettingStyles: CourierStyles.Preferences.SettingStyles(
        font: CourierStyles.Font(
            font: UIFont(name: "Avenir Medium", size: 18)!,
            color: .white
        ),
        toggleColor: secondaryColor
    ),
    sheetCornerRadius: 0,
    sheetCellStyles: CourierStyles.Cell(
        separatorStyle: .none
    )
)

// Pass the theme to the view
let courierPreferences = CourierPreferences(
    mode: .channels([.push, .sms, .email]),
    lightTheme: preferencesTheme,
    darkTheme: preferencesTheme,
    onError: { error in
        print(error.localizedDescription)
    }
)

view.addSubview(courierPreferences)
...
```

If you are interested in using a Courier "Brand", here is where you can adjust that: [`Courier Studio`](https://app.courier.com/designer/brands). 

<table>
    <thead>
        <tr>
            <th width="850px" align="left">Supported Brand Styles</th>
            <th width="200px" align="center">Support</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left"><code>Primary Color</code></td>
            <td align="center">✅</td>
        </tr>
        <tr width="600px">
            <td align="left"><code>Show/Hide Courier Footer</code></td>
            <td align="center">✅</td>
        </tr>
    </tbody>
</table>

&emsp;

# Get All User Preferences

Returns all the user's preferences. [`listAllUserPreferences`](https://www.courier.com/docs/reference/user-preferences/list-all-user-preferences/)

```javascript
const preferences = await Courier.shared.getUserPreferences({
    paginationCursor: "asdf" // Optional
});
```

&emsp;

# Update Preference Topic

Updates a specific user preference topic. [`updateUserSubscriptionTopic`](https://www.courier.com/docs/reference/user-preferences/update-subscription-topic-preferences/)

```javascript
await Courier.shared.putUserPreferencesTopic({
    topicId: "9ADVWHD7Z1D4Q436SMECGDSDEWFA",
    status: CourierUserPreferencesStatus.OptedOut,
    hasCustomRouting: true,
    customRouting: [
        CourierUserPreferencesChannel.Push,
        CourierUserPreferencesChannel.Email,
        CourierUserPreferencesChannel.SMS
    ]
});
```

&emsp;

# Get Preference Topic

Gets a specific preference topic. [`getUserSubscriptionTopic`](https://www.courier.com/docs/reference/user-preferences/get-subscription-topic-preferences/)

```javascript
const topic = await Courier.shared.getUserPreferencesTopic({ 
    topicId: "9ADVWHD7Z1D4Q436SMECGDSDEWFA"
});
```
