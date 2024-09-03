#!/bin/bash

# Change to the example directory
cd "$(dirname "$0")/../example" || { echo "Failed to change to example directory"; exit 1; }

# Function to ensure react-native-version is installed
ensure_react_native_version() {
  if ! yarn list --depth=0 | grep -q "react-native-version"; then
    yarn add --dev react-native-version
  else
    echo "react-native-version is already installed, skipping installation."
  fi
}

# Function to ensure react-native-cli is installed
ensure_react_native_cli() {
  if ! command -v react-native &> /dev/null; then
    echo "react-native-cli is not installed. Installing..."
    npm install -g react-native-cli
  else
    echo "react-native-cli is already installed, skipping installation."
  fi
}

# Function to update build number for React Native project
update_build_number() {
  yarn react-native-version --increment-build --never-amend
}

# Function to build iOS app
build_ios_app() {
  cd ios
  pod install

  # npx rn-game-over --all

  # npx react-native bundle --entry-file ./index.js --dev false --reset-cache --platform ios --bundle-output ios/main.jsbundle --assets-dest ./

  
  # Generate the main.jsbundle file
  echo "Generating main.jsbundle..."
  react-native bundle --entry-file ../index.js --platform ios --dev false --bundle-output ./main.jsbundle --assets-dest ./

  # Define variables for the build
  SCHEME="CourierReactNativeExample"
  PROJECT="CourierReactNativeExample.xcodeproj"
  ARCHIVE_PATH="$PWD/build/CourierReactNativeExample.xcarchive"

  # Build the app and create an archive
  xcodebuild -project "$PROJECT" -scheme "$SCHEME" -archivePath "$ARCHIVE_PATH" archive || { echo "Build failed"; exit 1; }

  # Open the archive in Xcode Organizer
  open "$ARCHIVE_PATH"

  cd ..
}

# Function to build Android app
build_android_app() {
  cd android
  ./gradlew bundleRelease
  open app/build/outputs/bundle/release
  cd ..
}

# Function to run yarn before building apps
run_yarn() {
  echo "Running yarn to install dependencies..."
  yarn install
}

# Main execution
ensure_react_native_version
ensure_react_native_cli
update_build_number
run_yarn
build_ios_app
# build_android_app
