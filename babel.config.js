/* global __dirname */
const path = require('node:path');

const styledSourceDirectories = [
  path.join(__dirname, 'src') + path.sep,
  path.join(__dirname, 'components') + path.sep,
];

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        // Keep React Native's bootstrap modules out of NativeWind's import rewrite.
        test: (filename) =>
          styledSourceDirectories.some((directory) => filename?.startsWith(directory)),
        presets: ['nativewind/babel'],
      },
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
