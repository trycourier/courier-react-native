#!/usr/bin/env bash

# 1. Get all packages ready
echo "\n1️⃣  Installing yarn packages\n"
yarn install

# 2. Link the development package to the example project
echo "\n2️⃣  Linking development package\n"
yarn link
cd example
yarn link @trycourier/courier-react-native

# 3. Setup your dev env
echo "\n3️⃣  Setting up React Native dotenv\n"
yarn setupEnv

# 4. Install iOS Pods
echo "\n4️⃣  Installing iOS Pods\n"
cd ios
pod install
cd ..

# 5. Open Android Studio for project to install gradle dependencies
echo "\n5️⃣  Opening Android Studio to fetch gradle dependencies\n"
yarn add @react-native-community/cli-platform-android --dev
open -a /Applications/Android\ Studio.app android

echo '✅ Your dev environment is ready!'