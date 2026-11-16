import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

// React Native starts here under the scene-based life cycle, which the iOS 27 SDK requires.
// React Native 0.85 has no scene variant of startReactNative, so the window comes from the
// scene and the existing start call fills it.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(windowScene: windowScene)

    factory.startReactNative(
      withModuleName: "CourierReactNativeExample",
      in: window,
      launchOptions: nil
    )
  }
}
