const RELEASE_PROFILES = new Set(["preview", "production"]);

module.exports = ({ config }) => {
  const shouldGenerateDevClientScheme = !RELEASE_PROFILES.has(
    process.env.EAS_BUILD_PROFILE,
  );

  return {
    ...config,
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
