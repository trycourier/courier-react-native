#!/bin/bash

# Get the version from package.json
version=$(node -p "require('../package.json').version")

# Remove any leading/trailing whitespace
version=$(echo $version | xargs)

echo "Detected version: $version"

# Function to update the Swift files
update_swift_file() {
    local file=$1
    echo "Updating $file..."
    sed -i '' "s/Courier\.agent = CourierAgent\.reactNativeIOS(\"[^\"]*\")/Courier.agent = CourierAgent.reactNativeIOS(\"$version\")/" "$file"
    if [ $? -eq 0 ]; then
        echo "$file updated successfully."
    else
        echo "Failed to update $file."
        exit 1
    fi
}

# Function to update the Kotlin file
update_kotlin_file() {
    local file=$1
    echo "Updating $file..."
    sed -i '' "s/Courier\.agent = CourierAgent\.reactNativeAndroid(version = \"[^\"]*\")/Courier.agent = CourierAgent.reactNativeAndroid(version = \"$version\")/" "$file"
    if [ $? -eq 0 ]; then
        echo "$file updated successfully."
    else
        echo "Failed to update $file."
        exit 1
    fi
}

# Function to update the Objective-C file
update_objc_file() {
    local file=$1
    echo "Updating $file..."
    sed -i '' "s/Courier\.agent = \[CourierAgent reactNativeIOS:@\"[^\"]*\"\]/Courier.agent = [CourierAgent reactNativeIOS:@\"$version\"]/" "$file"
    if [ $? -eq 0 ]; then
        echo "$file updated successfully."
    else
        echo "Failed to update $file."
        exit 1
    fi
}

# Update the Swift file
update_swift_file "../ios/CourierReactNativeEventEmitter.swift"

# Update the Objective-C file
update_objc_file "../ios/CourierReactNativeDelegate.m"

# Update the Kotlin file
# update_kotlin_file "../android/src/main/java/com/courier/courierreactnative/CourierReactNativeModule.kt"

echo "All files updated successfully with version $version."
