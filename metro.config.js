const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const nativewindConfig = withNativewind(config);
const defaultResolveRequest = nativewindConfig.resolver.resolveRequest;
const lottieCommonJsEntry = require.resolve("lottie-react-native/lib/commonjs");

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "lottie-react-native") {
    return {
      filePath: lottieCommonJsEntry,
      type: "sourceFile",
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
