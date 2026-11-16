require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "courier-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "15.0" }
  s.source       = { :git => "https://github.com/trycourier/courier-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  # The Swift package manifest for React Native's SwiftPM mode, not a source file
  s.exclude_files = "ios/Package.swift"

  # Courier Core Dependency
  # Courier_iOS comes through Swift Package Manager (spm_dependency, React Native 0.75+), because
  # CocoaPods trunk goes read-only on December 2, 2026. Otherwise it falls back to trunk, which
  # stays on 6.0.10, the last Courier_iOS published there.
  courier_ios_version = "6.0.10"
  courier_ios_trunk_version = "6.0.10"
  # React Native 0.87 and 0.88 build static pods with Swift package dependencies into the shared
  # products dir, but rewrite the app's module map paths with the pod name rather than the module
  # name, so a pod with a hyphen in its name (this one) fails to build. 0.89 fixed it
  # (react/react-native#59182). Those versions fall back to CocoaPods trunk.
  spm_helper = $LOADED_FEATURES.find { |f| f.end_with?("cocoapods/spm.rb") }
  spm_helper_source = spm_helper ? File.read(spm_helper) : ""
  spm_helper_broken = spm_helper_source.include?("shared products dir") && !spm_helper_source.include?("product_module_name")
  if respond_to?(:spm_dependency, true) && !spm_helper_broken
    spm_dependency(s,
      url: "https://github.com/trycourier/courier-ios.git",
      requirement: { kind: "exactVersion", version: courier_ios_version },
      products: ["Courier_iOS"]
    )
  else
    s.dependency "Courier_iOS", courier_ios_trunk_version
  end

  # Use install_modules_dependencies helper to install the dependencies if React Native version >=0.71.0.
  # See https://github.com/facebook/react-native/blob/febf6b7f33fdb4904669f99d795eba4c0f95d7bf/scripts/cocoapods/new_architecture.rb#L79.
  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
  s.dependency "React-Core"

  # Don't install the dependencies when we run `pod install` in the old architecture.
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' then
    s.compiler_flags = folly_compiler_flags + " -DRCT_NEW_ARCH_ENABLED=1"
    s.pod_target_xcconfig = {
        "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/boost\"",
        "OTHER_CPLUSPLUSFLAGS" => "-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
    }
    s.dependency "React-RCTFabric"
    s.dependency "React-Codegen"
    s.dependency "RCT-Folly"
    s.dependency "RCTRequired"
    s.dependency "RCTTypeSafety"
    s.dependency "ReactCommon/turbomodule/core"
   end
  end
end
