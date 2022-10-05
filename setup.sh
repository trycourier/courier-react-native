#!/usr/bin/env bash

# 1. Get all packages ready
echo "\n1️⃣  Installing yarn packages\n"
yarn

# 2. Link the development package to the example project
echo "\n2️⃣  Linking development package\n"
yarn link
yarn example link @trycourier/courier-react-native

# 3. Setup your dev env
echo "\n3️⃣  Setting up React Native dotenv\n"
yarn example setupEnv

# 4. Open Android Studio for project to install gradle dependencies
echo "\n4️⃣  Opening Android Studio to fetch gradle dependencies\n"
open -a /Applications/Android\ Studio.app example/android

echo '✅ Your dev environment is ready!'