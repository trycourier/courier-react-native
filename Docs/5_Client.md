# `CourierClient`

Base layer Courier API wrapper.

## Initialization

Creating a client stores request authentication credentials only for that specific client. You can create as many clients as you'd like. See the "Going to Production" section <a href="https://github.com/trycourier/courier-react-native/blob/master/Docs/1_Authentication.md#going-to-production"><code>here</code></a> for more info.

```typescript
// Creating a client
const client = new CourierClient({
  userId:       "...",          // Optional. Likely needed for your use case. See above for more authentication details
  showLogs:     "...",          // Optional. Defaults to your current BuildConfig
  jwt:          "your_user_id",
  clientKey:    "...",          // Optional. Used only for Inbox
  tenantId:     ..,             // Optional. Used for scoping a client to a specific tenant
  connectionId: "...",          // Optional. Used for inbox websocket
});

// Details about the client
const options = client.options;

// Remove the api client
client.remove();
```

## Token Management APIs

All available APIs for Token Management

```typescript
// To customize the device of the token being saved
// You do not need this
const device = {
  appId: "...",        // Optional
  adId: "...",         // Optional
  deviceId: "...",     // Optional
  platform: "...",     // Optional
  manufacturer: "...", // Optional
  model: "...",        // Optional
}

await client.tokens.putUserToken({
  token: "...",
  provider: "firebase-fcm",
  device: device // Optional
)

// Deletes the token from Courier Token Management
await client.tokens.deleteUserToken({
  token: "..."
})
```

## Inbox APIs

All available APIs for Inbox

```typescript
// Get all inbox messages
// Includes the total count in the response
const messages = await client.inbox.getMessages({
  paginationLimit: 123,   // Optional
  startCursor: undefined, // Optional
});

// Returns only archived messages
// Includes the total count of archived message in the response
const archivedMessages = await client.inbox.getArchivedMessages({
  paginationLimit: 123,   // Optional
  startCursor: undefined, // Optional
});

// Gets the number of unread messages
const unreadCount = await client.inbox.getUnreadMessageCount();

// Tracking messages
await client.inbox.open({ messageId: "..." });
await client.inbox.read({ messageId: "..." });
await client.inbox.unread({ messageId: "..." });
await client.inbox.archive({ messageId: "..." });
await client.inbox.readAll();
```

## Preferences APIs

All available APIs for Preferences

```typescript
// Get all the available preference topics
const preferences = await client.preferences.getUserPreferences({
    paginationCursor: undefined // Optional
});

// Gets a specific preference topic
const topic = await client.preferences.getUserPreferenceTopic({
    topicId: "..."
});

// Updates a user preference topic
await client.preferences.putUserPreferenceTopic({
    topicId: "...",
    status: CourierUserPreferencesStatus.OptedIn,
    hasCustomRouting: true,
    customRouting: [CourierUserPreferencesChannel.DirectMessage]
});
```

## Branding APIs

All available APIs for Branding

```typescript
const brandRes = await client.brands.getBrand({
    brandId: "..."
});
```

## URL Tracking APIs

All available APIs for URL Tracking

```swift
// Pass a trackingUrl, usually found inside of a push notification payload or Inbox message
// Tell which event happened. 
// All available events: .clicked, .delivered, .opened, .read, .unread
await client.tracking.postTrackingUrl({
    url: "courier_tracking_url",
    event: CourierTrackingEvent.Clicked
});
```
