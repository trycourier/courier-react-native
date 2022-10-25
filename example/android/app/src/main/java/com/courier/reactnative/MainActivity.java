package com.courier.reactnative;


import com.courierreactnative.CourierReactNativeActivity;

public class MainActivity extends CourierReactNativeActivity {

  public MainActivity() {

    // If you opted-in for the New Architecture, we enable the Fabric Renderer.
    super(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);

  }

}
