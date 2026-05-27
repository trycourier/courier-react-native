#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

cd example-085 || { echo "Directory not found: example-085"; exit 1; }

if ! command -v gum &> /dev/null; then
  echo "gum is required. Install with: brew install gum"
  exit 1
fi

choice=$(gum choose "iOS" "Android" "Both")

echo ""
echo "Installing dependencies..."
yarn install

bump_ios() {
  PBXPROJ="ios/CourierReactNativeExample.xcodeproj/project.pbxproj"
  CURRENT=$(grep -m1 'CURRENT_PROJECT_VERSION' "$PBXPROJ" | sed 's/[^0-9]//g')
  NEXT=$((CURRENT + 1))
  sed -i '' "s/CURRENT_PROJECT_VERSION = ${CURRENT};/CURRENT_PROJECT_VERSION = ${NEXT};/g" "$PBXPROJ"
  echo "🔢 iOS build number: $CURRENT → $NEXT"
}

bump_android() {
  GRADLE="android/app/build.gradle"
  CURRENT=$(grep -m1 'versionCode' "$GRADLE" | sed 's/[^0-9]//g')
  NEXT=$((CURRENT + 1))
  sed -i '' "s/versionCode ${CURRENT}/versionCode ${NEXT}/" "$GRADLE"
  echo "🔢 Android versionCode: $CURRENT → $NEXT"
}

build_ios() {
  bump_ios
  echo ""
  echo "📱 iOS must be archived from Xcode."
  echo ""
  echo "Steps:"
  echo "  1. Open the workspace in Xcode (opening now...)"
  echo "  2. Select the 'CourierReactNativeExample' scheme"
  echo "  3. Set the destination to 'Any iOS Device (arm64)'"
  echo "  4. Product → Archive"
  echo "  5. Once complete, Window → Organizer"
  echo "  6. Select the archive → Distribute App"
  echo ""
  open ios/CourierReactNativeExample.xcworkspace
}

build_android() {
  bump_android
  echo ""
  echo "📦 Building Android..."
  cd android
  ./gradlew bundleRelease || { echo "❌ Android build failed"; exit 1; }
  open app/build/outputs/bundle/release
  echo "✅ Android build completed"
  cd - > /dev/null
}

case "$choice" in
  iOS) build_ios ;;
  Android) build_android ;;
  Both) build_ios && build_android ;;
esac
