#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v gum &> /dev/null; then
    echo "gum is required but not installed."
    echo "Install it with: brew install gum"
    exit 1
fi

get_current_version() {
    node -p "require('./package.json').version"
}

CURRENT=$(get_current_version)
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

gum style \
    --border rounded \
    --border-foreground 212 \
    --padding "0 2" \
    --margin "1 0" \
    "📦 Courier React Native — Package Version" \
    "" \
    "Current version: $CURRENT"

BUMP_TYPE=$(gum choose "patch → $MAJOR.$MINOR.$((PATCH + 1))" "minor → $MAJOR.$((MINOR + 1)).0" "major → $((MAJOR + 1)).0.0" "custom")

case "$BUMP_TYPE" in
    patch*)  NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))" ;;
    minor*)  NEW_VERSION="$MAJOR.$((MINOR + 1)).0" ;;
    major*)  NEW_VERSION="$((MAJOR + 1)).0.0" ;;
    custom)  NEW_VERSION=$(gum input --placeholder "x.y.z" --prompt "Version: ") ;;
esac

if [[ -z "$NEW_VERSION" ]]; then
    echo "No version entered. Aborting."
    exit 1
fi

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    gum style --foreground 196 "Invalid version format: $NEW_VERSION (expected x.y.z)"
    exit 1
fi

gum style \
    --border rounded \
    --border-foreground 214 \
    --padding "0 2" \
    "$CURRENT → $NEW_VERSION"

if ! gum confirm "Apply this version update?"; then
    echo "Cancelled."
    exit 0
fi

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version

# Update native agent version strings
sed -i '' "s/Courier\.agent = CourierAgent\.reactNativeIOS(\"[^\"]*\")/Courier.agent = CourierAgent.reactNativeIOS(\"$NEW_VERSION\")/" ios/CourierReactNativeEventEmitter.swift
sed -i '' "s/Courier\.agent = \[CourierAgent reactNativeIOS:@\"[^\"]*\"\]/Courier.agent = [CourierAgent reactNativeIOS:@\"$NEW_VERSION\"]/" ios/CourierReactNativeDelegate.m
sed -i '' "s/val COURIER_AGENT = CourierAgent\.ReactNativeAndroid(version = \"[^\"]*\")/val COURIER_AGENT = CourierAgent.ReactNativeAndroid(version = \"$NEW_VERSION\")/" android/src/main/java/com/courierreactnative/Utils.kt

gum style \
    --border rounded \
    --border-foreground 46 \
    --padding "0 2" \
    --margin "1 0" \
    "✅ Version updated to $NEW_VERSION" \
    "" \
    "  package.json                    → $NEW_VERSION" \
    "  CourierReactNativeEventEmitter  → $NEW_VERSION" \
    "  CourierReactNativeDelegate      → $NEW_VERSION" \
    "  Utils.kt                        → $NEW_VERSION"
