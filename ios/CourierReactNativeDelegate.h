//
//  CourierReactNativeDelegate.h
//  courier-react-native
//
//  Created by Michael Miller on 8/29/23.
//

#import <React/RCTBridge.h>
#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>

@class RCTSurfacePresenterBridgeAdapter;
@class RCTTurboModuleManager;

NS_ASSUME_NONNULL_BEGIN

@interface CourierReactNativeDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

/// The window object, used to render the UViewControllers
@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) RCTBridge *bridge;
@property (nonatomic, strong) NSString *moduleName;
@property (nonatomic, strong) NSDictionary *initialProps;

/**
 * It creates a `RCTBridge` using a delegate and some launch options.
 * By default, it is invoked passing `self` as a delegate.
 * You can override this function to customize the logic that creates the RCTBridge
 *
 * @parameter: delegate - an object that implements the `RCTBridgeDelegate` protocol.
 * @parameter: launchOptions - a dictionary with a set of options.
 *
 * @returns: a newly created instance of RCTBridge.
 */
- (RCTBridge *)createBridgeWithDelegate:(id<RCTBridgeDelegate>)delegate launchOptions:(NSDictionary *)launchOptions;

/**
 * It creates a `UIView` starting from a bridge, a module name and a set of initial properties.
 * By default, it is invoked using the bridge created by `createBridgeWithDelegate:launchOptions` and
 * the name in the `self.moduleName` variable.
 * You can override this function to customize the logic that creates the Root View.
 *
 * @parameter: bridge - an instance of the `RCTBridge` object.
 * @parameter: moduleName - the name of the app, used by Metro to resolve the module.
 * @parameter: initProps - a set of initial properties.
 *
 * @returns: a UIView properly configured with a bridge for React Native.
 */
- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps;

/**
 * It creates the RootViewController.
 * By default, it creates a new instance of a `UIViewController`.
 * You can override it to provide your own initial ViewController.
 *
 * @return: an instance of `UIViewController`.
 */
- (UIViewController *)createRootViewController;

/// This method controls whether the App will use RuntimeScheduler. Only applicable in the legacy architecture.
///
/// @return: `YES` to use RuntimeScheduler, `NO` to use JavaScript scheduler. The default value is `YES`.
- (BOOL)runtimeSchedulerEnabled;

#if RCT_NEW_ARCH_ENABLED

/// The TurboModule manager
@property (nonatomic, strong) RCTTurboModuleManager *turboModuleManager;
@property (nonatomic, strong) RCTSurfacePresenterBridgeAdapter *bridgeAdapter;

/// This method controls whether the `turboModules` feature of the New Architecture is turned on or off.
///
/// @note: This is required to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the Turbo Native Module are enabled. Otherwise, it returns `false`.
- (BOOL)turboModuleEnabled;

/// This method controls whether the App will use the Fabric renderer of the New Architecture or not.
///
/// @return: `true` if the Fabric Renderer is enabled. Otherwise, it returns `false`.
- (BOOL)fabricEnabled;

#endif

@end

NS_ASSUME_NONNULL_END
