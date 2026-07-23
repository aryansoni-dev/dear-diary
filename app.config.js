const {
  resolveRevenueCatBuildConfigFromEnvironment,
} = require("./lib/subscription/revenueCatBuildConfig");

module.exports = ({ config }) => {
  const shouldGenerateDevClientScheme =
    process.env.EAS_BUILD_PROFILE === "development";
  const revenueCat = resolveRevenueCatBuildConfigFromEnvironment(process.env);

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      revenueCat,
    },
    plugins: (config.plugins || []).map((plugin) => {
      const isDevClientPlugin =
        plugin === "expo-dev-client" ||
        (Array.isArray(plugin) && plugin[0] === "expo-dev-client");

      if (!isDevClientPlugin) {
        return plugin;
      }

      const pluginOptions = Array.isArray(plugin) ? plugin[1] : undefined;

      return [
        "expo-dev-client",
        {
          ...pluginOptions,
          addGeneratedScheme: shouldGenerateDevClientScheme,
        },
      ];
    }),
  };
};
