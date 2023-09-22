<img width="1000" alt="banner-react-native-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/7c771766-fe9b-45bc-a8b0-d5f72da12099">

&emsp;

# Courier Inbox

An in-app notification center list you can use to notify your users. Allows you to build high quality, flexible notification feeds very quickly.

## Requirements

<table>
    <thead>
        <tr>
            <th width="250px" align="left">Requirement</th>
            <th width="750px" align="left">Reason</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <tr width="600px">
                <td align="left">
                    <a href="https://app.courier.com/channels/courier">
                        <code>Courier Inbox Provider</code>
                    </a>
                </td>
                <td align="left">
                    Needed to link your Courier Inbox to the SDK
                </td>
            </tr>
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/feature/courier-inbox/Docs/Authentication.md">
                    <code>Authentication</code>
                </a>
            </td>
            <td align="left">
                Needed to view inbox messages that belong to a user.
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## Default Inbox Example

<img width="894" alt="default-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/e39a1f20-5636-48a9-9337-e1416fbb67bf">

#### ⚠️ Important Android Requirement

Because Courier Inbox uses your apps native styles as the default colors, you need to make sure your `styles.xml` theme parent extends `MaterialComponents`.

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

&emsp;

In your React Native project, add the View to your app:

```javascript
import Courier, { CourierInboxView } from '@trycourier/courier-react-native';

...

<CourierInboxView
  onClickInboxMessageAtIndex={(message, index) => {
    console.log(message)
    message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId })
  }}
  onClickInboxActionForMessageAtIndex={(action, message, index) => {
    console.log(action)
  }}
  style={...} />
```

&emsp;

## Styled Inbox Example

<img width="894" alt="styled-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/46ad8b3a-5931-490c-8f48-d36c05e89abd">

The styles you can use to quickly customize the `CourierInbox`.

#### Fonts:

TODO: Discuss

```javascript
const textColor = '#2A1537'
const primaryColor = '#882DB9'
const secondaryColor = '#EA6866'

const titleFont = Platform.OS === 'ios' ? 'Avenir Black' : 'fonts/poppins_regular.otf'
const defaultFont = Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'

const lightTheme: CourierInboxTheme = {
  unreadIndicatorBarColor: secondaryColor,
  loadingIndicatorColor: primaryColor,
  titleFont: {
    family: titleFont,
    size: 20,
    color: textColor
  },
  timeFont: {
    family: defaultFont,
    size: 16,
    color: textColor
  },
  bodyFont: {
    family: defaultFont,
    size: 18,
    color: textColor
  },
  detailTitleFont: {
    family: defaultFont,
    size: 20,
    color: textColor
  },
  buttonStyles: {
    font: {
      family: titleFont,
      size: 16,
      color: '#FFFFFF'
    },
    backgroundColor: primaryColor,
    cornerRadius: 100
  },
  iOS: {
    messageAnimationStyle: 'right',
    cellStyles: {
      separatorStyle: 'singleLineEtched',
      separatorInsets: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  },
  android: {
    dividerItemDecoration: 'vertical'
  }
}

const darkTheme: CourierInboxTheme = {
  unreadIndicatorBarColor: '#ffffff',
  loadingIndicatorColor: '#ffffff',
  titleFont: {
    family: titleFont,
    size: 20,
    color: '#ffffff'
  },
  timeFont: {
    family: defaultFont,
    size: 16,
    color: '#ffffff'
  },
  bodyFont: {
    family: defaultFont,
    size: 18,
    color: '#ffffff'
  },
  detailTitleFont: {
    family: defaultFont,
    size: 20,
    color: '#ffffff'
  },
  buttonStyles: {
    font: {
      family: titleFont,
      size: 16,
      color: '#000000'
    },
    backgroundColor: '#ffffff',
    cornerRadius: 100
  },
  iOS: {
    messageAnimationStyle: 'right',
    cellStyles: {
      separatorStyle: 'singleLineEtched',
      separatorInsets: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  },
  android: {
    dividerItemDecoration: 'vertical'
  }
}

<CourierInboxView 
  theme={{
    light: lightTheme,
    dark: darkTheme
  }}
  onClickInboxMessageAtIndex={(message, index) => {
    console.log(message)
    message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId });
  }}
  onClickInboxActionForMessageAtIndex={(action, message, index) => {
    console.log(action);
  }}
  onScrollInbox={(y, x) => {
    console.log(`Inbox scroll offset y: ${y}`);
  }}
  style={...} />
```

## Custom Inbox Example

⚠️ TODO
<img width="894" alt="custom-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/90456f3d-c39f-4d66-aac1-d1d62a84f3c5">

The raw data you can use to build any UI you'd like.

```javascript
class CustomInboxFragment: Fragment(R.layout.fragment_custom_inbox) {

    private lateinit var inboxListener: CourierInboxListener
    private lateinit var recyclerView: RecyclerView
    private val messagesAdapter = MessagesAdapter()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Create the list
        recyclerView = view.findViewById(R.id.recyclerView)
        recyclerView.adapter = messagesAdapter

        // Setup the listener
        inboxListener = Courier.shared.addInboxListener(
            onInitialLoad = {
                ..
            },
            onError = { error ->
                ..
            },
            onMessagesChanged = { messages, unreadMessageCount, totalMessageCount, canPaginate ->
                messagesAdapter.messages = messages
                messagesAdapter.notifyDataSetChanged()
            }
        )

    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        inboxListener.remove()
    }

}
```

&emsp;

## Full Examples

<table>
    <thead>
        <tr>
            <th width="800px" align="left">Link</th>
            <th width="200px" align="center">Style</th>
        </tr>
    </thead>
    <tbody>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-android/blob/master/app/src/main/java/com/courier/example/fragments/PrebuiltInboxFragment.kt">
                    <code>Default Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-android/blob/master/Docs/Inbox.md#default-inbox-example">
                    <code>Default</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-android/blob/master/app/src/main/java/com/courier/example/fragments/StyledInboxFragment.kt">
                    <code>Styled Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-android/blob/master/Docs/Inbox.md#styled-inbox-example">
                    <code>Styled</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-android/blob/master/app/src/main/java/com/courier/example/fragments/CustomInboxFragment.kt">
                    <code>Custom Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-android/blob/master/Docs/Inbox.md#custom-inbox-example">
                    <code>Custom</code>
                </a>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## Available Properties and Functions

```kotlin

// Listen to all inbox events
// Only one "pipe" of data is created behind the scenes for network / performance reasons
val inboxListener = Courier.shared.addInboxListener(
    onInitialLoad = {
        // Called when the inbox starts up
    },
    onError = { error ->
        // Called if an error occurs
    },
    onMessagesChanged = { messages, unreadMessageCount, totalMessageCount, canPaginate ->
        // Called when messages update
    }
)

// Stop the current listener
inboxListener.remove()

// Remove all listeners
// This will also remove the listener of the prebuilt UI
Courier.shared.removeAllInboxListeners()

// The amount of inbox messages to fetch at a time
// Will affect prebuilt UI
Courier.shared.inboxPaginationLimit = 123

// The available messages the inbox has
val inboxMessages = Courier.shared.inboxMessages

lifecycle.coroutineScope.launch {

    // Fetches the next page of messages
    Courier.shared.fetchNextPageOfMessages()

    // Reloads the inbox
    // Commonly used with pull to refresh
    Courier.shared.refreshInbox()

    // Reads all the messages
    // Writes the update instantly and performs request in background
    try await Courier.shared.readAllInboxMessages()

}

// Mark message as read/unread
let message = InboxMessage(..)
message.markAsRead()
message.markAsUnread()

```
