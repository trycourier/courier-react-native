// swift-tools-version: 6.0
import PackageDescription

// Swift Package Manager support for React Native's SwiftPM autolinking
// (react-native >= 0.87). CocoaPods users are unaffected; see the podspec.
// The two React Native packages are resolved by the autolinker relative to
// build/generated/autolinking/libs/CourierReactNative in the app.
//
// SPM can't compile Swift and Objective-C in one target, so the Objective-C
// sources (the RCT_EXTERN_MODULE declarations and CourierReactNativeDelegate)
// get their own target. Neither target imports the other.
let package = Package(
    name: "CourierReactNative",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "CourierReactNative", targets: ["CourierReactNative", "CourierReactNativeObjC"]),
    ],
    dependencies: [
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        // Kept in step with courier_ios_version in courier-react-native.podspec
        .package(url: "https://github.com/trycourier/courier-ios", exact: "6.0.10"),
    ],
    targets: [
        .target(
            name: "CourierReactNative",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
                .product(name: "Courier_iOS", package: "courier-ios"),
            ],
            path: ".",
            exclude: [
                "CourierReactNative.xcodeproj",
                "CourierReactNative-Bridging-Header.h",
                "ObjC",
                "Package.swift",
            ],
            sources: [
                "CourierClientModule.swift",
                "CourierInboxReactNativeManager.swift",
                "CourierPreferencesReactNativeManager.swift",
                "CourierReactNativeEventEmitter.swift",
                "CourierSharedModule.swift",
                "CourierSystemModule.swift",
                "Utils.swift",
            ],
            // The bridge is written for Swift 5, the language mode CocoaPods builds it in
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .target(
            name: "CourierReactNativeObjC",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
                .product(name: "Courier_iOS", package: "courier-ios"),
            ],
            path: "ObjC",
            publicHeadersPath: "include"
        ),
    ]
)
