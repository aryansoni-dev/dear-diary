module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        require.resolve("expo/internal/babel-preset"),
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
  };
};
