<!-- Generated from https://www.courier.com/docs/in-app/customize-preferences by mintlify-docs. Edit the docs source, not this file. -->

# Customize the preference center

> Theme the preferences component for light and dark mode, or build your own UI on the client methods that read and write a user's topics and routing.

Source: https://www.courier.com/docs/in-app/customize-preferences

[Add a preference center](https://www.courier.com/docs/in-app/add-a-preference-center) covers embedding it. Theme it or build your own UI on the same methods, below.

## Theme

Theme the preferences center with a light and a dark `CourierPreferencesTheme`, as in the code below.

```jsx
<CourierPreferencesView theme={{ light: { /* ... */ }, dark: { /* ... */ } }} />;
```

Full theme reference for each SDK: [iOS](https://www.courier.com/docs/sdk-libraries/ios#preferences-theme), [Android](https://www.courier.com/docs/sdk-libraries/android#preferences-theme), [Flutter](https://www.courier.com/docs/sdk-libraries/flutter#preferences-theme), and [React Native](https://www.courier.com/docs/sdk-libraries/react-native#preferences-theme).

## Custom UI

The preferences component doesn't take render slots yet. To render preferences in your own UI, read and write topics through the preferences client. The same methods exist on every platform. The mobile SDKs use `Courier.shared.client.preferences`:

```typescript
// Get the client, available after signIn
const client = await Courier.shared.getClient();

const prefs = await client.preferences.getUserPreferences({
  paginationCursor: undefined,
});

await client.preferences.putUserPreferenceTopic({
  topicId: "TOPIC_ID",
  status: CourierUserPreferencesStatus.OptedIn,
  hasCustomRouting: true,
  customRouting: [CourierUserPreferencesChannel.Push],
});
```

See your platform's SDK reference for the exact signatures.

**`putUserPreferenceTopic` replaces the topic's routing rather than merging into it.** Send `hasCustomRouting` and the full `customRouting` array together, because omitting a channel removes it.
