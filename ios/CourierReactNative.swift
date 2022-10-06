import Courier_iOS
@objc(CourierReactNative)
class CourierReactNative: NSObject {

  private static let COURIER_ERROR_TAG = "Courier iOS SDK Error"
  internal static let CORE_CHANNEL = "courier_flutter_core"
  internal static let EVENTS_CHANNEL = "courier_flutter_events"


  @objc(multiply: withB: withResolver: withRejecter:)
  func multiply(a: Float, b: Float, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    resolve(a * b)
  }

  @objc(signIn: accessToken: withResolver: withRejecter:)
  func signIn(userId: NSString, accessToken: NSString, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.shared.signIn(accessToken: accessToken as String, userId: userId as String, onSuccess: {
      let successMessage = "**************** Credentials are set **************"
      resolve(successMessage)
    }, onFailure: { error in
        reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
      })
  }

  @objc(signOut: withRejecter:)
  func signOut(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    Courier.shared.signOut(onSuccess: {
      resolve("Signout successful")
    }, onFailure: { error in
        reject(String(describing: error), CourierReactNative.COURIER_ERROR_TAG, nil)
      })
  }

  @objc(getUserId: withRejecter:)
  func getUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
    resolve(Courier.shared.userId)
  }


}
