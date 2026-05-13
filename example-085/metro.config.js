const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');
const modules = Object.keys({ ...pak.peerDependencies });

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root, path.resolve(__dirname, '../node_modules')],

  resolver: {
    blockList: modules.map(
      (m) =>
        new RegExp(
          `^${escapeRegExp(path.join(root, 'node_modules', m))}\\/.*$`
        )
    ),

    extraNodeModules: modules.reduce(
      (acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      },
      {
        '@trycourier/courier-react-native': root,
      }
    ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
