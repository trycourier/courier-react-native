package com.courierreactnative

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class CourierReactNativePackage : TurboReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      "CourierClientModule" -> CourierClientModule(reactContext)
      "CourierSharedModule" -> CourierSharedModule(reactContext)
      "CourierSystemModule" -> CourierSystemModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val modules = mutableMapOf<String, ReactModuleInfo>()
      val moduleNames = listOf("CourierClientModule", "CourierSharedModule", "CourierSystemModule")
      for (moduleName in moduleNames) {
        modules[moduleName] = ReactModuleInfo(
          moduleName,
          moduleName,
          false,
          false,
          true,
          false,
          false
        )
      }
      modules
    }
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      CourierInboxViewManager(),
      CourierPreferencesViewManager(),
    )
  }

}
