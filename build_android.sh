#!/bin/bash
cd example && npx react-native build-android --mode=release
open android/app/build/outputs/bundle/release/