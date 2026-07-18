const RELEASE_PROFILES = new Set(["preview", "production"]);

module.exports = ({ config }) => {
  const shouldGenerateDevClientScheme = !RELEASE_PROFILES.has(
    process.env.EAS_BUILD_PROFILE,
  );

  return {
    ...config,
    plugins: (config.plugins || []).map((plugin) =>
      plugin === "expo-dev-client"
        ? [
            "expo-dev-client",
            { addGeneratedScheme: shouldGenerateDevClientScheme },
          ]
        : plugin,
    ),
  };
};
