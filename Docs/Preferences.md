<img width="1040" alt="banner-react-native-preferences" src="https://github.com/trycourier/courier-react-native/assets/6370613/2d5190c1-5f44-45db-aa26-50e4275ea7f1">

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

<img width="200" alt="default-inbox-styles" src="https://github.com/trycourier/courier-ios/assets/6370613/483a72be-3869-43a2-ab48-a07a8c7b4cf2.gif">
<img width="200" alt="default-inbox-styles" src="https://github.com/trycourier/courier-android/assets/6370613/681a8de9-536a-40cb-93bf-8e51caae7f4b.gif">

```javascript
import { CourierPreferencesView } from '@trycourier/courier-react-native';

<CourierPreferencesView 
  mode={{ type: 'topic' }}
  style={...}
/>
```

&emsp;

## Styled Preferences View

The styles you can use to quickly customize the `CourierPreferencesView`.

<img width="200" alt="default-inbox-styles" src="https://github.com/trycourier/courier-ios/assets/6370613/4291c507-ffe4-41de-b551-596e5f33ff72.gif">
<img width="200" alt="default-inbox-styles" src="https://github.com/trycourier/courier-android/assets/6370613/67c6b772-f6e3-4937-b090-b0769d64d100.gif">

```javascript
import { CourierPreferencesView } from '@trycourier/courier-react-native';

const styles = {
  Fonts: {
    heading: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf',
    title: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf',
    subtitle: Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'
  },
  Colors: {
    heading: isDark ? '#9747FF' : '#9747FF',
    title: isDark ? '#FFFFFF' : '#000000',
    subtitle: isDark ? '#9A9A9A' : '#BEBEBE',
    option: isDark ? '#1F1F1F' : '#F0F0F0',
    action: isDark ? '#9747FF' : '#9747FF',
  },
  TextSizes: {
    heading: 24,
    title: 18,
    subtitle: 16,
  },
  Corners: {
    button: 100
  }
}

const theme = {
  brandId: 'ASDFASDF',
  sectionTitleFont: {
    family: styles.Fonts.heading,
    size: styles.TextSizes.heading,
    color: styles.Colors.heading
  },
  topicTitleFont: {
    family: styles.Fonts.title,
    size: styles.TextSizes.title,
    color: styles.Colors.title
  },
  topicSubtitleFont: {
    family: styles.Fonts.subtitle,
    size: styles.TextSizes.subtitle,
    color: styles.Colors.subtitle
  },
  topicButton: {
    font: {
      family: styles.Fonts.subtitle,
      size: styles.TextSizes.subtitle,
      color: styles.Colors.title
    },
    backgroundColor: styles.Colors.option,
    cornerRadius: styles.Corners.button
  },
  sheetTitleFont: {
    family: styles.Fonts.heading,
    size: styles.TextSizes.heading,
    color: styles.Colors.heading
  },
  infoViewStyle: {
    font: {
      family: styles.Fonts.title,
      size: styles.TextSizes.title,
      color: styles.Colors.title
    },
    button: {
      font: {
        family: styles.Fonts.subtitle,
        size: styles.TextSizes.subtitle,
        color: styles.Colors.action
      },
      backgroundColor: styles.Colors.title,
      cornerRadius: styles.Corners.button
    }
  },
  iOS: {
    topicCellStyles: {
      separatorStyle: 'none'
    },
    sheetSettingStyles: {
      font: {
        family: styles.Fonts.title,
        size: styles.TextSizes.title,
        color: styles.Colors.title
      },
      toggleColor: styles.Colors.action
    },
    sheetCornerRadius: 20,
    sheetCellStyles: {
      separatorStyle: 'none'
    }
  },
  android: {
    topicDividerItemDecoration: 'vertical',
    sheetDividerItemDecoration: 'vertical',
    sheetSettingStyles: {
      font: {
        family: styles.Fonts.title,
        size: styles.TextSizes.title,
        color: styles.Colors.title
      },
      toggleThumbColor: styles.Colors.action,
      toggleTrackColor: styles.Colors.option,
    }
  }
}

<CourierPreferencesView 
  mode={{ 
    type: 'channels', 
    channels: ['push', 'sms', 'email'] 
  }}
  theme={{
    light: theme,
    dark: theme,
  }}
  onScrollPreferences={(y, x) => {
    console.log(`Preferences scroll offset y: ${y}`);
  }}
  onPreferenceError={(error) => {
    console.log(error)
  }}
  style={...}
 />
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

## Custom Preferences APIs

The raw data you can use to build whatever UI you'd like.

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
