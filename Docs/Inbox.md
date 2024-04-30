<img width="1040" alt="banner-react-native-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/f138f4a4-fa64-417b-91c7-90aa8802624d">

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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Authentication.md">
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

The default `CourierInboxView` styles.

<img width="894" alt="default-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/e39a1f20-5636-48a9-9337-e1416fbb67bf">

#### ⚠️ Important Android Requirement

Because Courier Inbox uses Android's Material theme and your app's styles as the default colors, you need to make sure your `styles.xml` theme parent extends `MaterialComponents`.

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
import { CourierInboxView } from '@trycourier/courier-react-native';

<CourierInboxView
  onClickInboxMessageAtIndex={(message, index) => {
    console.log(message)
    message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId })
  }}
  onClickInboxActionForMessageAtIndex={(action, message, index) => {
    console.log(action)
  }}
  style={...} 
/>
```

&emsp;

## Styled Inbox Example

The styles you can use to quickly customize the `CourierInboxView`.

<img width="894" alt="styled-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/46ad8b3a-5931-490c-8f48-d36c05e89abd">

#### ⚠️ Android Theme Requirement

Be sure to add support for the material theme. More info [`here`](https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md#%EF%B8%8F-important-android-requirement).

Setting `CourierInboxTheme` will override your app's default `styles.xml` theme.

#### Custom Fonts:

iOS fonts point to the name of the font you have loaded into your app's fonts resources. More about that can be found [`here`](https://developer.apple.com/documentation/uikit/text_display_and_fonts/adding_a_custom_font_to_your_app).

Android fonts point to system fonts with the path included. More about Android fonts [`here`](https://developer.android.com/develop/ui/views/text-and-emoji/fonts-in-xml).

```javascript
import { CourierInboxView } from '@trycourier/courier-react-native';

// See above for more details about fonts
const textColor = '#2A1537'
const primaryColor = '#882DB9'
const secondaryColor = '#EA6866'

const titleFont = Platform.OS === 'ios' ? 'Avenir Black' : 'fonts/poppins_regular.otf'
const defaultFont = Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'

const theme: CourierInboxTheme = {
  loadingIndicatorColor: primaryColor,
  unreadIndicatorStyle: {
    indicator: 'dot',
    color: secondaryColor
  },
  titleStyle: {
    unread: {
      family: titleFont,
      size: 20,
      color: textColor
    },
    read: {
      family: titleFont,
      size: 20,
      color: textColor
    }
  },
  timeStyle: {
    unread: {
      family: defaultFont,
      size: 16,
      color: textColor
    },
    read: {
      family: defaultFont,
      size: 16,
      color: textColor
    }
  },
  bodyStyle: {
    unread: {
      family: defaultFont,
      size: 18,
      color: textColor
    },
    read: {
      family: defaultFont,
      size: 18,
      color: textColor
    }
  },
  buttonStyle: {
    unread: {
      font: {
        family: titleFont,
        size: 16,
        color: '#FFFFFF'
      },
      backgroundColor: primaryColor,
      cornerRadius: 100
    },
    read: {
      font: {
        family: titleFont,
        size: 16,
        color: '#FFFFFF'
      },
      backgroundColor: primaryColor,
      cornerRadius: 100
    }
  },
  infoViewStyle: {
    font: {
      family: defaultFont,
      size: 20,
      color: textColor
    },
    button: {
      font: {
        family: titleFont,
        size: 16,
        color: '#FFFFFF'
      },
      backgroundColor: primaryColor,
      cornerRadius: 100
    }
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
    light: theme,
    dark: theme
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
  style={...} 
/>
```

## Custom Inbox Example

The raw data you can use to build any UI you'd like.

<img width="894" alt="custom-inbox" src="https://github.com/trycourier/courier-react-native/assets/6370613/90456f3d-c39f-4d66-aac1-d1d62a84f3c5">

```javascript
import Courier from '@trycourier/courier-react-native';

const Page = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inbox, setInbox] = useState<any>({});

  useEffect(() => {

    Courier.shared.setInboxPaginationLimit({ limit: 100 });

    const inboxListener = Courier.shared.addInboxListener({
      onInitialLoad() {
        setIsLoading(true);
      },
      onError(error) {
        setIsLoading(false);
        setError(error);
      },
      onMessagesChanged(messages, unreadMessageCount, totalMessageCount, canPaginate) {
        setIsLoading(false);
        setError(null);
        setInbox({
          messages,
          unreadMessageCount,
          totalMessageCount,
          canPaginate
        });
      },
    });

    return () => {
      inboxListener.remove();
    };

  }, []);

  if (isLoading) {
    return <Text>Loading</Text>
  }

  if (error) {
    return <Text>{error}</Text>
  }

  return (
    <FlatList
      data={inbox?.messages}
      keyExtractor={message => message.messageId}
      renderItem={message => <ListItem message={message.item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
        />
      }
      ListFooterComponent={() => {
        return inbox?.canPaginate ? <PaginationItem /> : null
      }}
      onEndReached={() => {
        if (inbox?.canPaginate) {
          Courier.shared.fetchNextPageOfMessages();
        }
      }}
    />
  )

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
                <a href="https://github.com/trycourier/courier-react-native/blob/master/example/src/pages/InboxDefault.tsx">
                    <code>Default Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md#default-inbox-example">
                    <code>Default</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/example/src/pages/InboxStyled.tsx">
                    <code>Styled Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md#styled-inbox-example">
                    <code>Styled</code>
                </a>
            </td>
        </tr>
        <tr width="600px">
            <td align="left">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/example/src/pages/InboxCustom.tsx">
                    <code>Custom Example</code>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/Inbox.md#custom-inbox-example">
                    <code>Custom</code>
                </a>
            </td>
        </tr>
    </tbody>
</table>

&emsp;

## Available Properties and Functions

```javascript
// Pagination limit
Courier.shared.setInboxPaginationLimit({ limit: 100 });

// Inbox listener
const inboxListener = Courier.shared.addInboxListener({
  onInitialLoad: () => {
    // Handle loading
  },
  onError: (error) => {
    // Handle error
  },
  onMessagesChanged: (messages, unreadMessageCount, totalMessageCount, canPaginate) => {
    // Handle data
  }
});

// Remove the listener
Courier.shared.removeInboxListener({ messageId: 'asdf' });

// Refresh inbox
await Courier.shared.refreshInbox();

// Read all messages
await Courier.shared.readAllInboxMessages();

// Read a single message
await Courier.shared.readMessage({ messageId: 'asdf' });

// Unread a single message
await Courier.shared.unreadMessage({ messageId: 'asdf' });

// Fetch a new page of messages
const messages = await Courier.shared.fetchNextPageOfMessages()
```
