package com.courierreactnative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class CourierReactNativePackage : ReactPackage {

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      CourierClientModule(reactContext),
      CourierSharedModule(reactContext),
      CourierSystemModule(reactContext),
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      CourierInboxViewManager(),
      CourierPreferencesViewManager(),
    )
  }

}
