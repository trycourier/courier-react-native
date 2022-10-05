# Welcome to Courier React Native contributing guide

## Getting Started

From the root directory, run:

```sh
yarn setup
```

From here, you are all set to start working on the package! 🙌

## Testing & Debugging

While developing, you can run the [example app](/example/) to test your changes. Any changes you make in your library's JavaScript code will be reflected in the example app without a rebuild. If you change any native code, then you'll need to rebuild the example app.

To run the React Native example app use:

```sh
yarn example android
```
or
```sh
yarn example ios
```

To debug the Android package:
1. Run `yarn example android` from root
2. Open `example/android` in Android Studio
3. Click Debug

To debug the iOS package:
`TODO`

## Details about `yarn setup`

While it's possible to use [`npm`](https://github.com/npm/cli), the tooling is built around [`yarn`](https://classic.yarnpkg.com/), so you'll have an easier time if you use `yarn` for development.

## Link the project

in the root directory run:

```sh
yarn link
```

navigate to example directory, run:

```sh
yarn link @trycourier/courier-react-native
```

## Setup Env variables

in the example directory run:

```sh
yarn setupEnv
```

a .env file will be created in the example directory
populate the variables with appropriate values

## Android sdk setup

open android studio

- open the android folder in root directory in android studio,
- open example/android folder in android studio. wait for gradle build to finish

in example/android directory change the tab to project, paste
`google-services.json` in `CourierReactNativeExample/app` directory

To start the packager:

connect your android device

check if your device is available under adb devices, run:

```sh
adb devices
```
