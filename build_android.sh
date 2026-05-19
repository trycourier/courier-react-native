#!/bin/bash
cd example-085 && npx react-native build-android --mode=release
open android/app/build/outputs/bundle/release/