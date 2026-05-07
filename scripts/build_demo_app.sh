#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

cd example || { echo "Directory not found: example"; exit 1; }

echo "Installing dependencies..."
yarn install

echo ""
echo "📦 Building iOS..."
cd ios
pod install
SCHEME="CourierReactNativeExample"
WORKSPACE="CourierReactNativeExample.xcworkspace"
ARCHIVE_PATH="$PWD/build/ios/archive/CourierReactNativeExample.xcarchive"

xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -sdk iphoneos \
  -archivePath "$ARCHIVE_PATH" \
  archive || { echo "❌ iOS build failed"; exit 1; }

open "$ARCHIVE_PATH"
echo "✅ iOS build completed and opened in Xcode Organizer"
cd ..

echo ""
echo "📦 Building Android..."
cd android
./gradlew bundleRelease || { echo "❌ Android build failed"; exit 1; }
open app/build/outputs/bundle/release
echo "✅ Android build completed"
cd ..
